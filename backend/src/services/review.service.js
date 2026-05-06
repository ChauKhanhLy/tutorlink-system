import Review from '../models/review.model.js';
import Booking from '../models/booking.model.js';
import TutorProfile from '../models/tutor_profile.model.js';
import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';

export const createReview = async (data) => {
    const existed = await Review.findOne({
        where: {
            booking_id: data.booking_id,
            reviewer_id: data.reviewer_id
        }
    });
    if (existed) {
        throw new Error("Bạn đã đánh giá buổi học này rồi.");
    }

    const booking = await Booking.findByPk(data.booking_id);
    if (!booking) throw new Error("Không tìm thấy lịch học tương ứng");
    
    if (booking.status !== 'completed') {
        throw new Error("Chỉ có thể đánh giá các buổi học đã hoàn thành");
    }

    const newReview = await Review.create(data);
    const tutorId = booking.tutor_id;
    const [result] = await sequelize.query(`
        SELECT AVG(rating) as new_avg FROM reviews 
        WHERE booking_id IN (SELECT id FROM bookings WHERE tutor_id = :tutorId)
    `, {
        replacements: { tutorId },
        type: sequelize.QueryTypes.SELECT
    });

    const newAvg = parseFloat(result.new_avg || 0).toFixed(1);
    console.log(`Dữ liệu tính toán được: ${newAvg}`);

    const profile = await TutorProfile.findByPk(tutorId);
    
    if (profile) {
        profile.rating_avg = newAvg;
        await profile.save();
        
        console.log("✅ Đã lưu điểm mới vào pgAdmin thành công!");
    } else {
        console.log(`❌ KHÔNG TÌM THẤY Gia sư có ID ${tutorId} trong bảng tutor_profiles`);
        console.log("Hãy chắc chắn rằng cái mã UUID trong bảng Bookings và bảng TutorProfiles là giống hệt nhau.");
    }

    return newReview;
};

export const getReviewsByBooking = async (booking_id) => {
    return await Review.findAll({ where: {booking_id}});
};

export const getReviewsByTutor = async (tutor_id) => {
    return await sequelize.query(`
      SELECT
        r.id,
        r.booking_id,
        r.reviewer_id,
        r.rating,
        r.comment,
        r.created_at
      FROM reviews r
      JOIN bookings b ON b.id = r.booking_id
      WHERE b.tutor_id = :tutorId
      ORDER BY r.created_at DESC
    `, {
      replacements: { tutorId: tutor_id },
      type: QueryTypes.SELECT
    });
};