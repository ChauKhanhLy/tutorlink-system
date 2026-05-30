import Booking from '../models/booking.model.js';
import VideoRoom from '../models/videoRoom.model.js';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import db from '../config/db.js';
import { spendFromWallet } from './wallet.service.js';

export const getTutorSubjects = async (tutorId) => {
    const result = await db.query('SELECT subject_id FROM tutor_subjects WHERE tutor_id = $1', [tutorId]);
    return result.rows;
};

export const createBooking = async (data) => {
    const { tutor_id, learner_id, datetime, type } = data;

    //CHUẨN HÓA THỜI GIAN
    const startReq = new Date(datetime);
    startReq.setSeconds(0, 0); // Ép về 00 giây để so sánh chính xác
    const isoStart = startReq.toISOString();
    // Regular booking: 120 phút, Trial booking: 50 phút
    const durationMinutes = type === 'trial' ? 50 : 120;

    // Tính giờ kết thúc dự kiến
    const endReq = new Date(startReq.getTime() + durationMinutes * 60000);
    const isoEnd = endReq.toISOString();

    // --- LOGIC MỚI: GIỚI HẠN HỌC THỬ ---
    if (type === 'trial') {
        // Tìm xem trong quá khứ, học sinh này đã từng đặt lịch 'trial' với gia sư này chưa
        const existingTrial = await Booking.findOne({
            where: {
                learner_id: learner_id,
                tutor_id: tutor_id,
                type: 'trial',
                status: { [Op.in]: ['confirmed', 'done', 'pending'] } // Chỉ tính các buổi đã/đang/sắp diễn ra
            }
        });

        if (existingTrial) {
            throw new Error('Bạn đã hết lượt học thử với gia sư này. Vui lòng chọn "Học thật"!');
        }
    }

    const conflictQuery = `
        SELECT * FROM bookings 
        WHERE tutor_id = $1 
        AND status IN ('confirmed', 'done')
        AND (
            $2 < (datetime + (CASE WHEN type = 'trial' THEN INTERVAL '50 minutes' ELSE INTERVAL '2 hours' END))
            AND
            $3 > datetime
        )
    `;

    const existing = await db.query(conflictQuery, [tutor_id, isoStart, isoEnd]);

    if (existing.rows.length > 0) {
        // Lấy thông tin lịch bị trùng để báo lỗi chi tiết
        const conflict = existing.rows[0];
        const start = new Date(conflict.datetime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' });
        const conflictDurationMin = conflict.type === 'trial' ? 50 : 120;
        const end = new Date(new Date(conflict.datetime).getTime() + conflictDurationMin * 60000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' });

        throw new Error(`Gia sư đã có lịch dạy từ ${start} đến ${end}. Vui lòng chọn khung giờ khác!`);
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
        const durationMinutes = booking.type === 'trial' ? 50 : 120;
        const room = await createVideoRoom(booking.id, booking.datetime, durationMinutes);
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
export const createVideoRoom = async (bookingId, datetime, durationMinutes = 120) => {
    try {
        const existingRoom = await VideoRoom.findOne({ where: { booking_id: bookingId } });
        if (existingRoom) return existingRoom;

        const startTime = new Date(datetime);
        const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000); 

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

export const getBookingById = async (id) => {
    const query = `
        SELECT 
            b.*,
            u.name as tutorName,
            u.avatar as tutorAvatar,
            u.id as tutorId,
            l.name as studentName,
            s.name as subjectName,
            vs.id as room_id,
            vs.status as room_status,
            vs.start_time as room_start_time,
            vs.end_time as room_end_time
        FROM bookings b
        JOIN users u ON b.tutor_id = u.id
        JOIN users l ON b.learner_id = l.id
        LEFT JOIN subjects s ON b.subject_id = s.id
        LEFT JOIN video_sessions vs ON b.id = vs.booking_id
        WHERE b.id = $1
    `;
    const result = await db.query(query, [id]);
    const booking = result.rows[0];

    if (booking && booking.status === 'confirmed' && !booking.room_id) {
        const durationMinutes = booking.type === 'trial' ? 50 : 120;
        const newRoom = await createVideoRoom(booking.id, booking.datetime, durationMinutes);
        if (newRoom) {
            booking.room_id = newRoom.id;
        }
    }

    return booking;
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
            const durationMinutes = booking.type === 'trial' ? 50 : 120;
            const newRoom = await createVideoRoom(booking.id, booking.datetime, durationMinutes);
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
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // Lấy thông tin booking hiện tại (với lock để tránh race condition)
        const bookingRes = await client.query('SELECT * FROM bookings WHERE id = $1 FOR UPDATE', [id]);
        if (bookingRes.rows.length === 0) throw new Error("Không tìm thấy lịch học");
        const booking = bookingRes.rows[0];
        const oldStatus = booking.status;

        // --- BƯỚC CHẶN KHI DUYỆT (TRÁNH DUYỆT TRÙNG) ---
        if (oldStatus === 'pending' && status === 'confirmed') {
            const durationMinutes = booking.type === 'trial' ? 50 : 120;
            const startReq = new Date(booking.datetime);
            const endReq = new Date(startReq.getTime() + durationMinutes * 60000);
            
            const isoStart = startReq.toISOString();
            const isoEnd = endReq.toISOString();

            console.log(`Checking conflict for booking ${id} (Type: ${booking.type}). Start: ${isoStart}, End: ${isoEnd}`);

            const conflictQuery = `
                SELECT id, datetime, type FROM bookings 
                WHERE tutor_id = $1 
                AND id != $2
                AND status IN ('confirmed', 'done') 
                AND (
                    $3::timestamp < (datetime + (CASE WHEN type = 'trial' THEN INTERVAL '50 minutes' ELSE INTERVAL '2 hours' END))
                    AND
                    $4::timestamp > datetime
                )
            `;

            const conflict = await client.query(conflictQuery, [booking.tutor_id, id, isoStart, isoEnd]);

            if (conflict.rows.length > 0) {
                const conf = conflict.rows[0];
                const confStart = new Date(conf.datetime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' });
                const confDur = conf.type === 'trial' ? 50 : 120;
                const confEnd = new Date(new Date(conf.datetime).getTime() + confDur * 60000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' });
                
                console.log(`Conflict found with booking ${conf.id} at ${conf.datetime}`);
                throw new Error(`Không thể duyệt! Bạn đã có một lịch dạy ${conf.type === 'trial' ? 'học thử' : 'học thật'} từ ${confStart} đến ${confEnd} đã được xác nhận.`);
            }

            // Thực hiện trừ tiền
            if (booking.type === 'regular' && parseFloat(booking.fee) > 0) {
                console.log(`Deducting fee ${booking.fee} from learner ${booking.learner_id}`);
                await spendFromWallet(booking.learner_id, booking.fee, id, `Thanh toán buổi học #${id}`);
            }
        }

        // Cập nhật trạng thái
        await client.query('UPDATE bookings SET status = $1 WHERE id = $2', [status, id]);
        await client.query('COMMIT');

        // Tìm lại đối tượng đã cập nhật để return
        const updatedBooking = await Booking.findByPk(id);

        // Emit socket notification cho learner khi status thay đổi
        try {
            const { app } = await import('../app.js');
            const io = app.get('io');
            if (io) {
                io.to(updatedBooking.learner_id.toString()).emit('booking_status_changed', {
                    bookingId: updatedBooking.id,
                    status: updatedBooking.status,
                    oldStatus: oldStatus,
                    message: status === 'cancelled' ? 'Lịch học đã bị từ chối/hủy' :
                        status === 'confirmed' ? 'Lịch học đã được xác nhận' :
                            `Trạng thái lịch học đã thay đổi thành: ${status}`
                });
            }
        } catch (error) {
            console.error('Error emitting socket notification:', error);
        }

        // Tự động tạo VideoRoom khi xác nhận
        if (status === 'confirmed') {
            const existingRoom = await VideoRoom.findOne({ where: { booking_id: id } });
            if (!existingRoom) {
                const durationMinutes = updatedBooking.type === 'trial' ? 50 : 120;
                await createVideoRoom(id, updatedBooking.datetime, durationMinutes);
            }
        }

        return updatedBooking;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("updateStatus error:", error);
        throw error;
    } finally {
        client.release();
    }
};

export const getBookingsForTutor = async (tutor_id) => {
    const query = `
        SELECT 
            b.*,
            u.name as studentName,
            u.avatar as studentAvatar,
            s.name as subject,
            vs.id as room_id,
            vs.status as room_status,
            vs.start_time as room_start_time,
            vs.end_time as room_end_time
        FROM bookings b
        JOIN users u ON b.learner_id = u.id
        LEFT JOIN subjects s ON b.subject_id = s.id
        LEFT JOIN video_sessions vs ON b.id = vs.booking_id
        WHERE b.tutor_id = $1 AND b.status != 'cancelled'
        ORDER BY b.datetime ASC
    `;
    const result = await db.query(query, [tutor_id]);
    const bookings = result.rows;

    // Đảm bảo các buổi đã confirmed đều có phòng họp
    await ensureVideoRoomsExist(bookings);

    return bookings;
};