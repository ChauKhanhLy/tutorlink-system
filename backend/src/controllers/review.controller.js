import * as ReviewService from '../services/review.service.js';

export const postReview = async (req, res) => {
    try {
        const { booking_id, rating, comment } = req.body;

        const reviewer_id = "fe503b3d-9dac-4743-a7fa-eec8f41ed80a";

        if (!booking_id || !rating) {
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
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};