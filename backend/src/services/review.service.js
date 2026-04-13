import Review from '../models/review.model.js';
import Booking from '../models/booking.model.js';
import TutorProfile from '../models/tutor_profile.model.js';
import sequelize from '../config/database.js';

export const createReview = async (data) => {
    const newReview = await Review.create(data);
    const booking = await Booking.findByPk(data.booking_id);
    if (!booking) throw new Error("Không tìm thấy lịch học tương ứng");
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