import db from "../config/db.js";

function getExecutor(client) {
  return client || db;
}

async function findByLessonSessionId(lessonSessionId, client = null) {
  const executor = getExecutor(client);

  const result = await executor.query(
    `
    SELECT *
    FROM video_sessions
    WHERE lesson_session_id = $1
    LIMIT 1
    `,
    [lessonSessionId]
  );

  return result.rows[0] || null;
}

async function createVideoSession(
  { bookingId, lessonSessionId, roomId },
  client = null
) {
  const executor = getExecutor(client);

  const result = await executor.query(
    `
    INSERT INTO video_sessions (
      id,
      booking_id,
      lesson_session_id,
      room_id,
      provider,
      start_time,
      end_time,
      status,
      record_url,
      duration_minutes
    )
    VALUES (
      gen_random_uuid(),
      $1,
      $2,
      $3,
      'jitsi',
      NULL,
      NULL,
      'SCHEDULED',
      NULL,
      0
    )
    RETURNING *
    `,
    [bookingId, lessonSessionId, roomId]
  );

  return result.rows[0];
}

async function markStarted(lessonSessionId, client = null) {
  const executor = getExecutor(client);

  const result = await executor.query(
    `
    UPDATE video_sessions
    SET
      start_time = COALESCE(start_time, NOW()::TEXT),
      status = 'IN_PROGRESS'
    WHERE lesson_session_id = $1
    RETURNING *
    `,
    [lessonSessionId]
  );

  return result.rows[0] || null;
}

async function markEndedIfNoOneInside(lessonSessionId, client = null) {
  const executor = getExecutor(client);

  const result = await executor.query(
    `
    UPDATE video_sessions
    SET
      end_time = NOW()::TEXT,
      status = CASE
        WHEN NOT EXISTS (
          SELECT 1
          FROM attendance_logs
          WHERE lesson_session_id = $1
            AND left_at IS NULL
        )
        THEN 'ENDED'
        ELSE status
      END
    WHERE lesson_session_id = $1
    RETURNING *
    `,
    [lessonSessionId]
  );

  return result.rows[0] || null;
}

export default {
  findByLessonSessionId,
  createVideoSession,
  markStarted,
  markEndedIfNoOneInside
};