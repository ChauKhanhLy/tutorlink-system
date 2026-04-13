import Review from '../models/review.model.js';
import Booking from '../models/booking.model.js';
import sequelize from '../config/database.js';

export const createReview = async (data) => {
    const newReview = await Review.create(data);
    const booking = await Booking.findByPk(data.booking_id);
    const tutor_id = booking.tutor_id;
    const stats = await Review.findAll({
        where: {
            booking_id: {

            }
        },
        attributes: [
            [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']
        ],
        raw: true
    });

    console.log('Điểm trung bình mới của Gia sư ${tutor_id} là:', stats[0].avgRating);

    return newReview;
};

export const getReviewsByBooking = async (booking_id) => {
    return await Review.findAll({ where: {booking_id}});
};