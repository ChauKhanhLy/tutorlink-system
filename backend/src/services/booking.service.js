import Booking from '../models/booking.model.js';
import VideoRoom from '../models/videoRoom.model.js';
import { v4 as uuidv4 } from 'uuid';
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
    
    //return result.rows[0];
    const booking = result.rows[0];

    // Nếu booking ở trạng thái confirmed, tạo phòng học ngay lập tức
    if (booking.status === 'confirmed') {
        const room = await createVideoRoom(booking.id, booking.datetime);
        if (room) {
            booking.room_id = room.id;
            booking.room_status = room.status;
            booking.room_start_time = room.start_time;
            booking.room_end_time = room.end_time;
        }
    }
    
    return booking;
};

// Hàm bổ trợ để tạo phòng học video
export const createVideoRoom = async (bookingId, datetime) => {
    try {
        const existingRoom = await VideoRoom.findOne({ where: { booking_id: bookingId } });
        if (existingRoom) return existingRoom;

        const startTime = new Date(datetime);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Mặc định 1 tiếng

        return await VideoRoom.create({
            id: uuidv4(),
            booking_id: bookingId,
            room_id: `tutorlink-${bookingId}`,
            provider: 'jitsi',
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            status: 'scheduled'
        });
    } catch (err) {
        console.error(`Lỗi tạo phòng cho booking ${bookingId}:`, err);
        return null;
    }
};

export const getMyBookings = async (learner_id) => {
    const query = `
        SELECT 
            b.*,
            u.name as tutorName,
            s.name as subject,
            vs.id as room_id,
            vs.status as room_status,
            vs.start_time as room_start_time,
            vs.end_time as room_end_time
        FROM bookings b
        JOIN users u ON b.tutor_id = u.id
        LEFT JOIN subjects s ON b.subject_id = s.id
        LEFT JOIN video_sessions vs ON b.id = vs.booking_id
        WHERE b.learner_id = $1
        ORDER BY b.datetime ASC
    `;
    const result = await db.query(query, [learner_id]);
    const bookings = result.rows;
    
    // Đảm bảo các buổi đã confirmed đều có phòng họp
    await ensureVideoRoomsExist(bookings);
    
    return bookings;
};

// Hàm bổ trợ để tự động tạo phòng nếu thiếu
async function ensureVideoRoomsExist(bookings) {
    console.log(`Checking video rooms for ${bookings.length} bookings`);
    for (let booking of bookings) {
        if (booking.status === 'confirmed' && !booking.room_id) {
            // try {
            //     // Tạo phòng mới nếu chưa có
            //     const startTime = new Date(booking.datetime);
            //     const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
            //     const roomId = uuidv4().replace(/-/g, "");

            //     const newRoom = await VideoRoom.create({
            //         id: uuidv4(),
            //         booking_id: booking.id,
            //         room_id: `tutorlink-${booking.id}`,
            //         provider: 'jitsi',
            //         start_time: startTime.toISOString(),
            //         end_time: endTime.toISOString(),
            //         status: 'scheduled'
            //     });
            console.log(`Creating missing room for confirmed booking: ${booking.id}`);
            const newRoom = await createVideoRoom(booking.id, booking.datetime);
            if (newRoom) {
                
                // Cập nhật lại đối tượng booking trong memory để frontend nhận được ngay
                booking.room_id = newRoom.id;
                booking.room_status = newRoom.status;
                booking.room_start_time = newRoom.start_time;
                booking.room_end_time = newRoom.end_time;
            // } catch (err) {
            //     console.error(`Lỗi tự động tạo phòng cho booking ${booking.id}:`, err);
                console.log(`Room created successfully: ${newRoom.id}`);
            }
        }
    }
}

export const updateStatus = async (id, status) => {
    const booking = await Booking.findByPk(id);
    if (!booking) throw new Error("Không tìm thấy lịch học");
    
    const oldStatus = booking.status;
    booking.status = status;
    await booking.save();

    // Tự động tạo VideoRoom khi xác nhận
    if (status === 'confirmed') {
        const existingRoom = await VideoRoom.findOne({ where: { booking_id: id } });
        if (!existingRoom) {
            await createVideoRoom(id, booking.datetime);
        }
    }
    
    return booking;
};

export const getBookingsForTutor = async (tutor_id) => {
    const query = `
        SELECT 
            b.*,
            u.name as studentName,
            s.name as subject,
            vs.id as room_id,
            vs.status as room_status,
            vs.start_time as room_start_time,
            vs.end_time as room_end_time
        FROM bookings b
        JOIN users u ON b.learner_id = u.id
        LEFT JOIN subjects s ON b.subject_id = s.id
        LEFT JOIN video_sessions vs ON b.id = vs.booking_id
        WHERE b.tutor_id = $1
        ORDER BY b.datetime ASC
    `;
    const result = await db.query(query, [tutor_id]);
    const bookings = result.rows;
    
    // Đảm bảo các buổi đã confirmed đều có phòng họp
    await ensureVideoRoomsExist(bookings);
    
    return bookings;
};