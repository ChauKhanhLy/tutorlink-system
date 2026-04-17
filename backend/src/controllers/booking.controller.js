import * as BookingService from '../services/booking.service.js';
export const postBooking = async (req, res) => {
    try {
        const learner_id = req.user?.id;
        const tutor_id = req.body?.tutor_id || req.body?.tutorId;
        const datetime = req.body?.datetime || req.body?.startTime;
        const fee = req.body?.fee ?? 0;
        const subject_id = req.body?.subject_id || req.body?.subjectId || tutor_id;

        if (!learner_id || !tutor_id || !datetime) {
            return res.status(400).json({
                success: false,
                message: "Thiếu thông tin đặt lịch bắt buộc (tutor, thời gian)."
            });
        }

        const newBooking = await BookingService.createBooking ({
            ...req.body,
            tutor_id,
            datetime,
            fee,
            subject_id,
            learner_id
        });
        
        res.status(201).json({ success: true, data: newBooking});
    } catch (error) {
        res.status(400).json({success: false, message: error.message});
    }
};

export const getMyBookings = async (req, res) => {
    try {
        const learner_id = req.user?.id;
        if (!learner_id) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const bookings = await BookingService.getMyBookings(learner_id);

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