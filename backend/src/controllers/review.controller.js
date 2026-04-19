import * as ReviewService from '../services/review.service.js';

export const postReview = async (req, res) => {
    try {
        const booking_id = req.body?.booking_id || req.body?.bookingId;
        const { rating, comment } = req.body;

        const reviewer_id = req.user?.id;

        if (!booking_id || !rating || !reviewer_id) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp ID lịch học và số sao đánh giá."
            });
        }

        const newReview = await ReviewService.createReview({
            booking_id,
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