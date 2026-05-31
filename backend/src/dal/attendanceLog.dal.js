import db from "../config/db.js";

function getExecutor(client) {
  return client || db;
}

async function closeOpenLogsForUser(lessonSessionId, userId, client = null) {
  const executor = getExecutor(client);

  await executor.query(
    `
    UPDATE attendance_logs
    SET left_at = NOW()
    WHERE lesson_session_id = $1
      AND user_id = $2
      AND left_at IS NULL
    `,
    [lessonSessionId, userId]
  );
}

async function createJoinLog(lessonSessionId, userId, client = null) {
  const executor = getExecutor(client);

  const result = await executor.query(
    `
    INSERT INTO attendance_logs (
      id,
      lesson_session_id,
      user_id,
      joined_at,
      left_at
    )
    VALUES (
      gen_random_uuid(),
      $1,
      $2,
      NOW(),
      NULL
    )
    RETURNING *
    `,
    [lessonSessionId, userId]
  );

  return result.rows[0];
}

async function closeLatestOpenLog(lessonSessionId, userId, client = null) {
  const executor = getExecutor(client);

  const result = await executor.query(
    `
    UPDATE attendance_logs
    SET left_at = NOW()
    WHERE id = (
      SELECT id
      FROM attendance_logs
      WHERE lesson_session_id = $1
        AND user_id = $2
        AND left_at IS NULL
      ORDER BY joined_at DESC
      LIMIT 1
    )
    RETURNING *
    `,
    [lessonSessionId, userId]
  );

  return result.rows[0] || null;
}

async function calculateUserDurationHours(lessonSessionId, userId, client = null) {
  const executor = getExecutor(client);

  const result = await executor.query(
    `
    SELECT
      ROUND(
        (
          COALESCE(
            SUM(
              EXTRACT(
                EPOCH FROM (COALESCE(left_at, NOW()) - joined_at)
              )
            ),
            0
          ) / 3600.0
        )::NUMERIC,
        2
      ) AS duration_hours
    FROM attendance_logs
    WHERE lesson_session_id = $1
      AND user_id = $2
    `,
    [lessonSessionId, userId]
  );

  return Number(result.rows[0]?.duration_hours || 0);
}

export default {
  closeOpenLogsForUser,
  createJoinLog,
  closeLatestOpenLog,
  calculateUserDurationHours
};