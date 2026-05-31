import db from "../config/db.js";
import lessonSessionDal from "../dal/lessonSession.dal.js";
import videoSessionDal from "../dal/videoSession.dal.js";
import attendanceLogDal from "../dal/attendanceLog.dal.js";
import { depositToWallet } from "./wallet.service.js";

function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function ensureVideoSession(session, lessonSessionId, client = null) {
  let videoSession = await videoSessionDal.findByLessonSessionId(
    lessonSessionId,
    client
  );

  if (!videoSession) {
    const roomId = `tutorlink-${lessonSessionId}`;

    videoSession = await videoSessionDal.createVideoSession(
      {
        bookingId: session.booking_id,
        lessonSessionId,
        roomId
      },
      client
    );
  }

  return videoSession;
}

async function getOrCreateMeeting(lessonSessionId, userId) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const session = await lessonSessionDal.findLessonSessionForUser(
      lessonSessionId,
      userId,
      client
    );

    if (!session) {
      throw createHttpError("Bạn không có quyền vào buổi học này", 403);
    }

    const videoSession = await ensureVideoSession(
      session,
      lessonSessionId,
      client
    );

    await client.query("COMMIT");

    return {
      domain: "meet.jit.si",
      roomName: videoSession.room_id,
      provider: videoSession.provider,
      lessonSessionId,
      displayName: session.user_name,
      email: session.user_email
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function joinLessonSession(lessonSessionId, userId) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const session = await lessonSessionDal.findLessonSessionForUser(
      lessonSessionId,
      userId,
      client
    );

    if (!session) {
      throw createHttpError("Bạn không thuộc buổi học này", 403);
    }

    await ensureVideoSession(session, lessonSessionId, client);

    await attendanceLogDal.closeOpenLogsForUser(
      lessonSessionId,
      userId,
      client
    );

    const log = await attendanceLogDal.createJoinLog(
      lessonSessionId,
      userId,
      client
    );

    await lessonSessionDal.markInProgress(lessonSessionId, client);
    await videoSessionDal.markStarted(lessonSessionId, client);

    await client.query("COMMIT");

    return log;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function leaveLessonSession(lessonSessionId, userId) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const log = await attendanceLogDal.closeLatestOpenLog(
      lessonSessionId,
      userId,
      client
    );

    await videoSessionDal.markEndedIfNoOneInside(lessonSessionId, client);

    await client.query("COMMIT");

    return log;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function confirmTutorTaught(lessonSessionId, tutorId) {
  const updatedSession = await lessonSessionDal.tutorConfirm(
    lessonSessionId,
    tutorId
  );

  if (!updatedSession) {
    throw createHttpError("Bạn không có quyền xác nhận buổi học này", 403);
  }

  return updatedSession;
}

async function confirmLearnerStudied(lessonSessionId, learnerId) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const session = await lessonSessionDal.findLessonSessionByIdForUpdate(
      lessonSessionId,
      client
    );

    if (!session) {
      throw createHttpError("Không tìm thấy buổi học", 404);
    }

    if (String(session.learner_id) !== String(learnerId)) {
      throw createHttpError("Bạn không có quyền xác nhận buổi học này", 403);
    }

    if (!session.tutor_confirmed) {
      throw createHttpError("Gia sư chưa xác nhận đã dạy", 400);
    }

    // Đóng tất cả log còn mở (left_at IS NULL) của learner & tutor
    // Trường hợp user đóng tab thay vì nhấn nút "Kết thúc"
    await attendanceLogDal.closeOpenLogsForUser(lessonSessionId, learnerId, client);
    await attendanceLogDal.closeOpenLogsForUser(lessonSessionId, session.tutor_id, client);

    // Tính tổng thời gian học viên thực sự trong phòng (từ attendance_logs)
    let durationHours = await attendanceLogDal.calculateUserDurationHours(
      lessonSessionId,
      learnerId,
      client
    );

    if (durationHours <= 0) {
      // Fallback: Nếu không có logs nào, dùng thời lượng mặc định
      const bookingType = session.type || 'regular';
      durationHours = bookingType === 'trial' ? 1.0 : 2.0;
      console.log(`[confirmLearnerStudied] Không có attendance logs, dùng fallback duration: ${durationHours}h (type=${bookingType})`);
    } else {
      console.log(`[confirmLearnerStudied] Duration từ attendance_logs: ${durationHours}h (session=${lessonSessionId})`);
    }

    const updatedSession = await lessonSessionDal.learnerConfirm(
      lessonSessionId,
      learnerId,
      durationHours,
      client
    );

    await client.query("COMMIT");

    try {
      const complaintRes = await db.query(
        "SELECT id FROM complaints WHERE booking_id = $1 AND status != 'rejected' LIMIT 1",
        [session.booking_id]
      );
      const hasComplaint = complaintRes.rows.length > 0;

      if (hasComplaint) {
        console.log(`[confirmLearnerStudied] Buổi học #${session.booking_id} đang có khiếu nại chưa xử lý. Tạm hoãn giải ngân.`);
      } else {
        const pricePerHour = parseFloat(session.lesson_price_per_hour || session.fee || 0);
        if (pricePerHour > 0 && durationHours > 0) {
          const earnedAmount = parseFloat((pricePerHour * durationHours).toFixed(0));
          await depositToWallet(
            session.tutor_id,
            earnedAmount,
            `Thu nhập buổi dạy - ${durationHours}h × ${pricePerHour.toLocaleString('vi-VN')}₫/h`,
            session.booking_id,
            'booking'
          );
          console.log(`[confirmLearnerStudied] Đã giải ngân ${earnedAmount}₫ cho gia sư ${session.tutor_id}`);
        } else {
          console.log(`[confirmLearnerStudied] Bỏ qua giải ngân: pricePerHour=${pricePerHour}, duration=${durationHours}`);
        }
      }
    } catch (walletErr) {
      console.error('[confirmLearnerStudied] Lỗi giải ngân ví gia sư:', walletErr.message);
    }

    return updatedSession;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export default {
  getOrCreateMeeting,
  joinLessonSession,
  leaveLessonSession,
  confirmTutorTaught,
  confirmLearnerStudied
};