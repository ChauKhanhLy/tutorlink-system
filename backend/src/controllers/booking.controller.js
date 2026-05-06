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

        // Chỉ trừ tiền từ wallet cho buổi học thật (regular)
        if (type === 'regular' && fee > 0) {
            console.log(`Deducting ${fee} from wallet for regular lesson`);
            await WalletService.spendFromWallet(learner_id, fee, null, `Thanh toán buổi học - ${tutor_id}`);
        }

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

        console.log(`Creating booking: status=${type === 'trial' ? 'confirmed' : 'pending'}`);
        const newBooking = await BookingService.createBooking({
            learner_id,
            tutor_id,
            subject_id,
            datetime,
            fee: type === 'trial' ? 0 : fee, // Học thử thường miễn phí
            type,
            status: type === 'trial' ? 'confirmed' : 'pending'
        });
        
        console.log(`Booking created successfully: ${newBooking.id}`);
        res.status(201).json({ success: true, data: newBooking});
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
        const updated = await BookingService.updateStatus(id, 'confirmed');
        res.status(200).json({ success: true, message: "Thanh toán thành công!", data: updated });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await BookingService.updateStatus(id, 'cancel');
        res.status(200).json({ success: true, message: "Hủy lịch thành công", data: updated });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};