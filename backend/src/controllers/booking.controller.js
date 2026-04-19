import * as BookingService from '../services/booking.service.js';
import db from '../config/db.js';
export const postBooking = async (req, res) => {
    try {
        const learner_id = req.user?.id;
        const tutor_id = req.body?.tutor_id || req.body?.tutorId;
        const datetime = req.body?.datetime || req.body?.startTime;
        const fee = req.body?.fee ?? 0;
        const type = req.body?.type || 'regular'; // 'trial' hoặc 'regular'
        let subject_id = req.body?.subject_id || req.body?.subjectId;

        // Nếu subject_id bị thiếu, thử lấy từ tutor_subjects hoặc bảng subjects mặc định
        if (!subject_id || subject_id === tutor_id) {
            const tutorSubjects = await BookingService.getTutorSubjects(tutor_id);
            if (tutorSubjects && tutorSubjects.length > 0) {
                subject_id = tutorSubjects[0].subject_id;
            } else {
                // Lấy một môn học mặc định từ hệ thống (ví dụ: Toán) nếu gia sư chưa có môn học nào
                // Điều này giúp tránh lỗi NotNull Violation
                const defaultSubject = await db.query("SELECT id FROM subjects LIMIT 1");
                if (defaultSubject.rows.length > 0) {
                    subject_id = defaultSubject.rows[0].id;
                } else {
                    subject_id = null;
                }
            }
        }

        if (!learner_id || !tutor_id || !datetime) {
            return res.status(400).json({
                success: false,
                message: "Thiếu thông tin đặt lịch bắt buộc (tutor, thời gian)."
            });
        }

        const newBooking = await BookingService.createBooking({
            learner_id,
            tutor_id,
            subject_id,
            datetime,
            fee,
            type,
            status: 'pending'
        });
        
        res.status(201).json({ success: true, data: newBooking});
    } catch (error) {
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