import Review from '../models/review.model.js';
import Booking from '../models/booking.model.js';
import TutorProfile from '../models/tutor_profile.model.js';
import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';

export const createReview = async (data) => {
    const { review_type = 'session', booking_id, tutor_id, subject_id, reviewer_id, rating, comment } = data;

    console.log('=== DEBUG createReview ===');
    console.log('Input data:', data);
    console.log('review_type:', review_type);
    console.log('booking_id:', booking_id);
    console.log('tutor_id:', tutor_id);
    console.log('subject_id:', subject_id);

    if (review_type === 'session') {
        // Session review: đánh giá từng buổi học
        if (!booking_id) {
            throw new Error("Session review cần booking_id");
        }

        // Check duplicate review cho booking này
        const existed = await Review.findOne({
            where: {
                booking_id,
                reviewer_id,
                review_type: 'session'
            }
        });
        if (existed) {
            throw new Error("Bạn đã đánh giá buổi học này rồi.");
        }

        const booking = await Booking.findByPk(booking_id);
        if (!booking) throw new Error("Không tìm thấy lịch học tương ứng");

        console.log('Booking found:', booking);

        // Cho phép đánh giá khi: confirmed (đã xác nhận) hoặc completed (đã hoàn thành)
        // Không cho đánh giá nếu: pending (chờ xác nhận) hoặc cancelled (đã hủy)
        if (booking.status === 'pending' || booking.status === 'cancelled') {
            throw new Error("Chỉ có thể đánh giá các buổi học đã xác nhận hoặc đã hoàn thành");
        }

        // Lấy tutor_id và subject_id từ booking
        data.tutor_id = booking.tutor_id;
        data.subject_id = booking.subject_id;

        console.log('Data before create:', data);

        const newReview = await Review.create(data);
        console.log('New review created:', newReview);
        await updateTutorRating(booking.tutor_id);
        return newReview;

    } else if (review_type === 'tutor') {
        // Tutor review: đánh giá tổng thể gia sư (1 review/tutor/subject)
        if (!tutor_id || !subject_id) {
            throw new Error("Tutor review cần tutor_id và subject_id");
        }

        // Check duplicate review cho tutor/subject này
        const existed = await Review.findOne({
            where: {
                tutor_id,
                subject_id,
                reviewer_id,
                review_type: 'tutor'
            }
        });
        if (existed) {
            throw new Error("Bạn đã đánh giá gia sư này cho môn học này rồi.");
        }

        // Không cần booking_id cho tutor review
        data.booking_id = null;

        const newReview = await Review.create(data);
        await updateTutorRating(tutor_id);
        return newReview;

    } else {
        throw new Error("review_type phải là 'session' hoặc 'tutor'");
    }
};

const updateTutorRating = async (tutorId) => {
    const [result] = await sequelize.query(`
        SELECT AVG(rating) as new_avg FROM reviews
        WHERE tutor_id = :tutorId
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
};

export const getReviewsByBooking = async (booking_id) => {
    return await Review.findAll({ where: {booking_id}});
};

export const getReviewsByTutor = async (tutor_id) => {
    console.log('=== DEBUG getReviewsByTutor ===');
    console.log('tutor_id:', tutor_id);

    const reviews = await sequelize.query(`
      SELECT
        r.id,
        r.booking_id,
        r.reviewer_id,
        r.tutor_id,
        r.subject_id,
        r.review_type,
        r.rating,
        r.comment,
        r.created_at,
        s.name as subject_name
      FROM reviews r
      LEFT JOIN subjects s ON r.subject_id = s.id
      WHERE r.tutor_id = :tutorId
      ORDER BY r.created_at DESC
    `, {
      replacements: { tutorId: tutor_id },
      type: QueryTypes.SELECT
    });

    console.log('Reviews found:', reviews);
    console.log('Total reviews:', reviews.length);
    console.log('Session reviews:', reviews.filter(r => r.review_type === 'session').length);
    console.log('Tutor reviews:', reviews.filter(r => r.review_type === 'tutor').length);

    return reviews;
};