import * as ReviewService from '../services/review.service.js';

export const postReview = async (req, res) => {
    try {
        const booking_id = req.body?.booking_id || req.body?.bookingId;
        const tutor_id = req.body?.tutor_id || req.body?.tutorId;
        const subject_id = req.body?.subject_id || req.body?.subjectId;
        const review_type = req.body?.review_type || req.body?.reviewType || 'session';
        const { rating, comment } = req.body;

        const reviewer_id = req.user?.id;

        if (!rating || !reviewer_id) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp số sao đánh giá."
            });
        }

        if (review_type === 'session' && !booking_id) {
            return res.status(400).json({
                success: false,
                message: "Session review cần ID lịch học."
            });
        }

        if (review_type === 'tutor' && (!tutor_id || !subject_id)) {
            return res.status(400).json({
                success: false,
                message: "Tutor review cần ID gia sư và ID môn học."
            });
        }

        const newReview = await ReviewService.createReview({
            booking_id,
            tutor_id,
            subject_id,
            review_type,
            reviewer_id,
            rating,
            comment
        });

        res.status(201).json({
            success: true,
            message: "Gửi đánh giá thành công!",
            data: newReview
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getReviewsByTutor = async (req, res) => {
    try {
        const tutorId = req.query?.tutorId;
        if (!tutorId) {
            return res.status(400).json({
                success: false,
                message: "Thiếu tutorId"
            });
        }

        const reviews = await ReviewService.getReviewsByTutor(tutorId);
        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getReviewsByBooking = async (req, res) => {
    try {
        const bookingId = req.query?.bookingId;
        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: "Thiếu bookingId"
            });
        }

        const reviews = await ReviewService.getReviewsByBooking(bookingId);
        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};