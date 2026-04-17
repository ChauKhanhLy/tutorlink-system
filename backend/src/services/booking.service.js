import Booking from '../models/booking.model.js';
import { Op } from 'sequelize';
import db from '../config/db.js';

export const getTutorSubjects = async (tutorId) => {
    const result = await db.query('SELECT subject_id FROM tutor_subjects WHERE tutor_id = $1', [tutorId]);
    return result.rows;
};

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

export const getMyBookings = async (learner_id) => {
    const query = `
        SELECT 
            b.*,
            u.name as tutorName,
            s.name as subject
        FROM bookings b
        JOIN users u ON b.tutor_id = u.id
        LEFT JOIN subjects s ON b.subject_id = s.id
        WHERE b.learner_id = $1
        ORDER BY b.datetime ASC
    `;
    const result = await db.query(query, [learner_id]);
    return result.rows;
};

export const updateStatus = async (id, status) => {
    const booking = await Booking.findByPk(id);
    if (!booking) throw new Error("Không tìm thấy lịch học");
    booking.status = status;
    await booking.save();
    return booking;
};

export const getBookingsForTutor = async (tutor_id) => {
    const query = `
        SELECT 
            b.*,
            u.name as studentName,
            s.name as subject
        FROM bookings b
        JOIN users u ON b.learner_id = u.id
        LEFT JOIN subjects s ON b.subject_id = s.id
        WHERE b.tutor_id = $1
        ORDER BY b.datetime ASC
    `;
    const result = await db.query(query, [tutor_id]);
    return result.rows;
};