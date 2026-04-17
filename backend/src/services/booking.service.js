import Booking from '../models/booking.model.js';
import { Op } from 'sequelize';
import db from '../config/db.js';

export const getTutorSubjects = async (tutorId) => {
    const result = await db.query('SELECT subject_id FROM tutor_subjects WHERE tutor_id = $1', [tutorId]);
    return result.rows;
};

export const createBooking = async (data) => {
    const {tutor_id, datetime} = data;
    
    // Kiểm tra xem đã có lịch nào trùng chưa
    const query = 'SELECT * FROM bookings WHERE tutor_id = $1 AND datetime = $2 AND status != \'cancel\'';
    const existing = await db.query(query, [tutor_id, datetime]);

    if (existing.rows.length > 0) {
        throw new Error ('Gia su da ban vao khung gio nay!');
    }

    const insertQuery = `
        INSERT INTO bookings (learner_id, tutor_id, subject_id, datetime, status, fee, type)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
    `;
    const result = await db.query(insertQuery, [
        data.learner_id,
        data.tutor_id,
        data.subject_id,
        data.datetime,
        data.status || 'pending',
        data.fee || 0,
        data.type || 'regular'
    ]);
    
    return result.rows[0];
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