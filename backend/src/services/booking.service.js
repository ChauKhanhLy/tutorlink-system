import Booking from '../models/booking.model.js';
import { Op } from 'sequelize';

export const createBooking = async (data) => {
    const {tutor_id, datetime} = data;
    const existing = await Booking.findOne({
        where: {
            tutor_id,
            datetime,
            status: { [Op.ne]: 'cancel'}
        }
    });

    if (existing) {
        throw new Error ('Gia su da ban vao khung gio nay!');
    }

    return await Booking.create(data);
};

export const getBookings = async (learner_id) => {
    return await Booking.findAll({
        where: { learner_id},
        order: [['datetime', 'ASC']]
    });
};