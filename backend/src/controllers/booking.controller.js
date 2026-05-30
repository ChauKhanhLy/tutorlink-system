import * as BookingService from '../services/booking.service.js';
import * as WalletService from '../services/wallet.service.js';
import db from '../config/db.js';

export const postBooking = async (req, res) => {
    try {
        const learner_id = req.user?.id;
        const tutor_id = req.body?.tutor_id || req.body?.tutorId;
        const datetime = req.body?.datetime || req.body?.startTime;
        const fee = parseFloat(req.body?.fee) || 0; // Chuyển fee sang số
        const type = req.body?.type || 'regular'; // 'trial' hoặc 'regular'
        let subject_id = req.body?.subject_id || req.body?.subjectId;

        console.log(`Booking Request: type=${type}, fee=${fee}, learner=${learner_id}, tutor=${tutor_id}`);

        console.log(`Booking Request: type=${type}, fee=${fee}, learner=${learner_id}, tutor=${tutor_id}`);

        // Nếu subject_id bị thiếu hoặc không hợp lệ, thử lấy từ tutor_subjects hoặc bảng subjects mặc định
        let validSubject = null;
        if (subject_id) {
            const checkSubject = await db.query("SELECT id FROM subjects WHERE id = $1", [subject_id]);
            if (checkSubject.rows.length > 0) {
                validSubject = subject_id;
            }
        }

        if (!validSubject) {
            console.log(`Subject ${subject_id} not found, falling back...`);
            const tutorSubjects = await BookingService.getTutorSubjects(tutor_id);
            if (tutorSubjects && tutorSubjects.length > 0) {
                validSubject = tutorSubjects[0].subject_id;
            } else {
                const defaultSubject = await db.query("SELECT id FROM subjects LIMIT 1");
                if (defaultSubject.rows.length > 0) {
                    validSubject = defaultSubject.rows[0].id;
                }
            }
        }
        subject_id = validSubject;

        if (!learner_id || !tutor_id || !datetime) {
            return res.status(400).json({
                success: false,
                message: "Thiếu thông tin đặt lịch bắt buộc (tutor, thời gian)."
            });
        }

        // Kiểm tra trùng lịch (tính đến khoảng cách thời gian) trước khi trừ tiền
        // Regular booking: 120 phút, Trial booking: 50 phút
        const durationMinutes = type === 'trial' ? 50 : 120;
        const conflictQuery = `
            SELECT * FROM bookings 
            WHERE tutor_id = $1 
            AND status IN ('confirmed', 'done')
            AND (
                $2::timestamp < (datetime + (CASE WHEN type = 'trial' THEN INTERVAL '50 minutes' ELSE INTERVAL '2 hours' END))
                AND
                ($2::timestamp + INTERVAL '${durationMinutes} minutes') > datetime
            )
        `;
        const existing = await db.query(conflictQuery, [tutor_id, datetime]);
        if (existing.rows.length > 0) {
            const conflict = existing.rows[0];
            const startStr = new Date(conflict.datetime).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Ho_Chi_Minh'
            });
            const conflictDuration = conflict.type === 'trial' ? 50 : 120;
            const endStr = new Date(new Date(conflict.datetime).getTime() + conflictDuration * 60000).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Ho_Chi_Minh'
            });

            return res.status(400).json({ 
                success: false, 
                message: `Gia sư đã có lớp học từ ${startStr} đến ${endStr}. Vui lòng chọn khung giờ khác!` 
            });
        }

        // Chỉ trừ tiền từ wallet cho buổi học thật (regular) nếu nó được confirm ngay (ví dụ admin đặt hoặc luồng cũ)
        // Tuy nhiên, theo yêu cầu mới: Regular booking sẽ ở trạng thái pending và chỉ trừ tiền khi gia sư Accept.
        // Vậy ở đây chúng ta CHỈ kiểm tra số dư nếu là regular, nhưng CHƯA trừ tiền.
        if (type === 'regular' && fee > 0) {
            const wallet = await WalletService.getOrCreateWallet(learner_id);
            if (parseFloat(wallet.balance) < parseFloat(fee)) {
                return res.status(400).json({ success: false, message: 'Số dư ví không đủ để đặt lịch!' });
            }
            console.log(`User has enough balance (${wallet.balance}) for fee ${fee}. Deduction will happen on tutor acceptance.`);
        }

        console.log(`Creating booking: status=pending (Type: ${type})`);
        
        try {
            const newBooking = await BookingService.createBooking({
                learner_id,
                tutor_id,
                subject_id,
                datetime,
                fee: type === 'trial' ? 0 : fee, 
                type,
                status: 'pending'
            });

            console.log(`Booking created successfully: ${newBooking.id}`);
            res.status(201).json({ success: true, data: newBooking });
        } catch (bookingError) {
            // Nếu booking service throw error (conflict), trả về error luôn
            console.error(`Booking creation failed: ${bookingError.message}`);
            res.status(400).json({ success: false, message: bookingError.message });
        }
    } catch (error) {
        console.error(`Booking Error: ${error.message}`);
        res.status(400).json({success: false, message: error.message});
    }
};

export const getMyBookings = async (req, res) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;
        
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        let bookings = [];
        if (role === 'tutor') {
            bookings = await BookingService.getBookingsForTutor(userId);
        } else {
            bookings = await BookingService.getMyBookings(userId);
        }

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
};

export const payBooking = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID từ URL
        
        // Lấy thông tin booking để kiểm tra
        const bookingReq = await db.query('SELECT learner_id, fee, tutor_id, status FROM bookings WHERE id = $1', [id]);
        if (bookingReq.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy booking" });
        }
        
        const booking = bookingReq.rows[0];
        if (booking.status !== 'pending') {
            return res.status(400).json({ success: false, message: "Trạng thái booking không hợp lệ để thanh toán" });
        }

        // Gọi updateStatus để xử lý logic confirm và trừ tiền (đã được tập trung trong service)
        const updated = await BookingService.updateStatus(id, 'confirmed');
        res.status(200).json({ success: true, message: "Thanh toán thành công!", data: updated });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await BookingService.updateStatus(id, 'cancelled');
        res.status(200).json({ success: true, message: "Hủy lịch thành công", data: updated });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const acceptBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const tutorId = req.user?.id;

        // Kiểm tra quyền: chỉ gia sư của booking này mới được accept
        const booking = await db.query('SELECT * FROM bookings WHERE id = $1', [id]);
        if (booking.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy booking" });
        }
        
        if (booking.rows[0].tutor_id !== tutorId) {
            return res.status(403).json({ success: false, message: "Bạn không có quyền chấp nhận lịch học này" });
        }

        if (booking.rows[0].status !== 'pending') {
            return res.status(400).json({ success: false, message: "Lịch học này không ở trạng thái chờ xác nhận" });
        }

        const updated = await BookingService.updateStatus(id, 'confirmed');
        res.status(200).json({ success: true, message: "Đã chấp nhận lịch học và hoàn tất thanh toán", data: updated });
    } catch (error) {
        console.error("Accept Booking Error:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

export const rejectBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const tutorId = req.user?.id;

        // Kiểm tra quyền
        const booking = await db.query('SELECT * FROM bookings WHERE id = $1', [id]);
        if (booking.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy booking" });
        }
        
        if (booking.rows[0].tutor_id !== tutorId) {
            return res.status(403).json({ success: false, message: "Bạn không có quyền từ chối lịch học này" });
        }

        const updated = await BookingService.updateStatus(id, 'cancelled'); // Sửa lại cho khớp với constraint
        res.status(200).json({ success: true, message: "Đã từ chối lịch học", data: updated });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await BookingService.getBookingById(id);
        
        if (!booking) {
            return res.status(404).json({ success: false, message: "Không tìm thấy thông tin đặt lịch" });
        }
        
        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};