import db from "../config/db.js";
import lessonSessionDal from "../dal/lessonSession.dal.js";
import videoSessionDal from "../dal/videoSession.dal.js";
import attendanceLogDal from "../dal/attendanceLog.dal.js";

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

    let durationHours = await attendanceLogDal.calculateUserDurationHours(
      lessonSessionId,
      learnerId,
      client
    );

    if (durationHours <= 0) {
      // Fallback: Nếu không có logs, lấy thời lượng mặc định
      const bookingType = session.type || 'regular';
      durationHours = bookingType === 'trial' ? 1.0 : 2.0;
    }

    const updatedSession = await lessonSessionDal.learnerConfirm(
      lessonSessionId,
      learnerId,
      durationHours,
      client
    );

    await client.query("COMMIT");

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