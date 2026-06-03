import * as complaintDAL from '../dal/complaint.dal.js';
import { depositToWallet, spendFromWallet } from './wallet.service.js';
import db from '../config/db.js';

export const createComplaint = async (userId, data) => {
  if (!data.reported_id) throw new Error('Thiếu thông tin người bị khiếu nại');
  if (!data.title || !data.description) throw new Error('Vui lòng nhập đầy đủ tiêu đề và mô tả');
  if (userId === data.reported_id) throw new Error('Không thể khiếu nại chính mình');

  const complaint = await complaintDAL.createComplaint({
    reporter_id: userId,
    reported_id: data.reported_id,
    booking_id: data.booking_id || null,
    type: data.type,
    title: data.title,
    description: data.description,
    evidence: data.evidence || null,
  });
  return complaint;
};

export const getMyComplaints = async (userId) => {
  return await complaintDAL.getComplaintsByReporter(userId);
};

export const getAllComplaints = async (filters) => {
  return await complaintDAL.getAllComplaints(filters);
};

export const updateComplaintStatus = async (complaintId, status, resolution_note, adminId) => {
  if (!['pending', 'resolved', 'rejected'].includes(status)) {
    throw new Error('Trạng thái không hợp lệ');
  }

  const complaint = await complaintDAL.getComplaintById(complaintId);
  if (!complaint) throw new Error('Không tìm thấy khiếu nại');

  const updatedComplaint = await complaintDAL.updateComplaintStatus(complaintId, status, resolution_note);

  // Xử lý ví tiền và hoàn tiền/giải ngân
  if (complaint.booking_id) {
    const bookingId = complaint.booking_id;
    const bookingRes = await db.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
    const booking = bookingRes.rows[0];
    
    if (booking) {
      if (status === 'rejected') {
        // Gia sư thắng khiếu nại -> Giải ngân cho Gia sư
        // Kiểm tra xem gia sư đã nhận tiền cho booking này chưa
        const paidTxRes = await db.query(
          "SELECT id FROM transactions WHERE user_id = $1 AND reference_id = $2 AND type = 'deposit' LIMIT 1",
          [booking.tutor_id, bookingId]
        );
        const paidTx = paidTxRes.rows[0];

        if (!paidTx) {
          // Lấy thông tin thời lượng học thực tế (nếu học viên/gia sư đã xác nhận)
          const sessionRes = await db.query('SELECT * FROM lesson_sessions WHERE booking_id = $1', [bookingId]);
          const session = sessionRes.rows[0];
          
          let durationHours = session?.duration_hours ? parseFloat(session.duration_hours) : (booking.type === 'trial' ? 1.0 : 2.0);
          const pricePerHour = parseFloat(booking.lesson_price_per_hour || booking.fee || 0);
          const earnedAmount = parseFloat((pricePerHour * durationHours).toFixed(0));

          if (earnedAmount > 0) {
            await depositToWallet(
              booking.tutor_id,
              earnedAmount,
              `Thu nhập buổi dạy (Giải quyết khiếu nại) - ${durationHours}h × ${pricePerHour.toLocaleString('vi-VN')}₫/h`,
              bookingId,
              'booking'
            );
            console.log(`[updateComplaintStatus] Đã giải ngân ${earnedAmount}₫ cho gia sư ${booking.tutor_id} sau khi bác khiếu nại`);
          }
        }
      } else if (status === 'resolved') {
        // Học sinh thắng khiếu nại -> Hoàn tiền cho Học sinh và Trừ tiền của Gia sư (nếu đã nhận)
        
        // 1. Kiểm tra và trừ tiền của gia sư nếu đã nhận
        const paidTxRes = await db.query(
          "SELECT id, amount FROM transactions WHERE user_id = $1 AND reference_id = $2 AND type = 'deposit' LIMIT 1",
          [booking.tutor_id, bookingId]
        );
        const paidTx = paidTxRes.rows[0];

        if (paidTx) {
          // Gia sư đã nhận tiền → trừ lại
          const amountToDeduct = parseFloat(paidTx.amount);
          await spendFromWallet(
            booking.tutor_id,
            amountToDeduct,
            bookingId,
            `Trừ thu nhập do khiếu nại được chấp nhận - Buổi học #${bookingId}`
          );
          console.log(`[updateComplaintStatus] Đã trừ ${amountToDeduct}₫ từ gia sư ${booking.tutor_id} sau khi chấp nhận khiếu nại`);
        }

        // 2. Kiểm tra xem học sinh đã được hoàn tiền cho booking này chưa
        const refundedTxRes = await db.query(
          "SELECT id FROM transactions WHERE user_id = $1 AND reference_id = $2 AND type = 'refund' LIMIT 1",
          [booking.learner_id, bookingId]
        );
        const refundedTx = refundedTxRes.rows[0];

        if (!refundedTx) {
          const refundAmount = parseFloat(booking.fee);
          if (refundAmount > 0) {
            await depositToWallet(
              booking.learner_id,
              refundAmount,
              `Hoàn tiền khiếu nại buổi học #${bookingId}`,
              bookingId,
              'booking',
              'refund'
            );
            console.log(`[updateComplaintStatus] Đã hoàn ${refundAmount}₫ cho học sinh ${booking.learner_id} sau khi chấp nhận khiếu nại`);
          }
        }
      }
    }
  }

  return updatedComplaint;
};