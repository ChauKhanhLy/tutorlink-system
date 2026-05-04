import Booking from '../models/booking.model.js';
import { Op } from 'sequelize';
import db from '../config/db.js';

export const createBooking = async (data) => {
    const { tutor_id, datetime } = data;

    // 1. Chuẩn hóa ngày giờ (Đảm bảo lấy đúng giờ từ chuỗi gửi lên, không phụ thuộc múi giờ máy chủ)
    const bookingDate = new Date(datetime);
    
    // Lấy giờ và phút trực tiếp từ chuỗi ISO để tránh lệch múi giờ
    // Ví dụ: 2026-04-20T11:00:00Z -> Lấy ra 11:00
    const hours = String(bookingDate.getUTCHours()).padStart(2, '0');
    const minutes = String(bookingDate.getUTCMinutes()).padStart(2, '0');
    const bookingTime = `${hours}:${minutes}:00`;
    
    // Lấy thứ trong tuần (0: CN, 1: T2...)
    const bookingDayOfWeek = bookingDate.getUTCDay();

    console.log('=== LOG CHECK ===');
    console.log('Giờ đặt lịch (UTC):', bookingTime);
    console.log('Thứ:', bookingDayOfWeek);

    // 1.5. KIỂM TRA KHUNG GIỜ BOOKING HỢP LỆ
    // Chỉ cho phép booking vào các khung giờ: 7:00, 8:00, 9:00, 10:00
    const bookingHour = bookingDate.getUTCHours();
    const allowedHours = [7, 8, 9, 10]; // Chỉ cho phép booking các giờ này

    if (!allowedHours.includes(bookingHour)) {
        throw new Error(`Chỉ có thể đặt lịch vào các khung giờ: 7:00, 8:00, 9:00, 10:00. Không thể đặt lịch vào ${bookingHour}:00!`);
    }

    // 2. KIỂM TRA LỊCH RẢNH (Availability)
    // Sửa logic: Chỉ cần thời gian bắt đầu nằm trong khoảng rảnh 
    // và thời gian kết thúc của ca rảnh đó phải đủ cho buổi học.
    const durationHours = 2; // Độ dài buổi học
    
    const availQuery = `
        SELECT * FROM tutor_availabilities 
        WHERE tutor_id = $1 
        AND day_of_week = $2 
        AND start_time <= $3::time
        AND end_time >= ($3::time + CAST($4 || ' hours' AS interval))
        AND is_active = TRUE
    `;
    
    const availabilityCheck = await db.query(availQuery, [tutor_id, bookingDayOfWeek, bookingTime, durationHours]);

    if (availabilityCheck.rows.length === 0) {
        // Log thêm để debug xem gia sư rảnh đến mấy giờ
        const checkMaxTime = await db.query('SELECT end_time FROM tutor_availabilities WHERE tutor_id = $1 AND day_of_week = $2', [tutor_id, bookingDayOfWeek]);
        const msg = checkMaxTime.rows.length > 0 
            ? `Gia sư chỉ rảnh đến ${checkMaxTime.rows[0].end_time}. Không đủ 2 tiếng để dạy ca ${bookingTime}!` 
            : "Gia sư không có lịch rảnh vào ngày này!";
        throw new Error(msg);
    }

    // 3. KIỂM TRA TRÙNG LỊCH (Conflict)
    // Logic: Một buổi học 2 tiếng sẽ chặn các buổi học khác giao thoa trong khoảng đó
    const conflictQuery = `
        SELECT * FROM bookings 
        WHERE tutor_id = $1 
        AND status IN ('pending', 'confirmed')
        AND (
            (datetime <= $2 AND datetime + interval '2 hours' > $2) -- Bị trùng lúc bắt đầu
            OR
            (datetime < $2 + interval '2 hours' AND datetime >= $2) -- Bị trùng lúc kết thúc
        )
    `;
    const existing = await db.query(conflictQuery, [tutor_id, datetime]);

    if (existing.rows.length > 0) {
        throw new Error('Gia sư đã có lịch dạy khác trùng vào khoảng thời gian này!');
    }

    // 4. LƯU VÀO DATABASE
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