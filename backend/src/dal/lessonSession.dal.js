import db from "../config/db.js";

function getExecutor(client) {
  return client || db;
}

async function findLessonSessionForUser(lessonSessionId, userId, client = null) {
  const executor = getExecutor(client);

  const result = await executor.query(
    `
    SELECT
      ls.*,
      b.learner_id,
      b.tutor_id,
      b.subject_id,
      b.lesson_price_per_hour,
      u.name AS user_name,
      u.email AS user_email
    FROM lesson_sessions ls
    JOIN bookings b ON b.id = ls.booking_id
    JOIN users u ON u.id = $2
    WHERE ls.id = $1
      AND ($2 = b.learner_id OR $2 = b.tutor_id)
    `,
    [lessonSessionId, userId]
  );

  return result.rows[0] || null;
}

async function findLessonSessionByIdForUpdate(lessonSessionId, client = null) {
  const executor = getExecutor(client);

  const result = await executor.query(
    `
    SELECT
      ls.*,
      b.learner_id,
      b.tutor_id,
      b.type,
      b.lesson_price_per_hour
    FROM lesson_sessions ls
    JOIN bookings b ON b.id = ls.booking_id
    WHERE ls.id = $1
    FOR UPDATE
    `,
    [lessonSessionId]
  );

  return result.rows[0] || null;
}

async function markInProgress(lessonSessionId, client = null) {
  const executor = getExecutor(client);

  const result = await executor.query(
    `
    UPDATE lesson_sessions
    SET
      status = CASE
        WHEN status IS NULL OR status = 'SCHEDULED' THEN 'IN_PROGRESS'
        ELSE status
      END,
      updated_at = NOW()
    WHERE id = $1
    RETURNING *
    `,
    [lessonSessionId]
  );

  return result.rows[0] || null;
}

async function tutorConfirm(lessonSessionId, tutorId, client = null) {
  const executor = getExecutor(client);

  const result = await executor.query(
    `
    UPDATE lesson_sessions ls
    SET
      tutor_confirmed = TRUE,
      status = CASE
        WHEN learner_confirmed = TRUE THEN 'COMPLETED'
        ELSE 'WAIT_LEARNER'
      END,
      updated_at = NOW()
    FROM bookings b
    WHERE ls.booking_id = b.id
      AND ls.id = $1
      AND b.tutor_id = $2
    RETURNING ls.*
    `,
    [lessonSessionId, tutorId]
  );

  return result.rows[0] || null;
}

async function learnerConfirm(
  lessonSessionId,
  learnerId,
  durationHours,
  client = null
) {
  const executor = getExecutor(client);

  const result = await executor.query(
    `
    UPDATE lesson_sessions ls
    SET
      learner_confirmed = TRUE,
      attended = TRUE,
      duration_hours = $3,
      status = 'COMPLETED',
      updated_at = NOW()
    FROM bookings b
    WHERE ls.booking_id = b.id
      AND ls.id = $1
      AND b.learner_id = $2
      AND ls.tutor_confirmed = TRUE
    RETURNING ls.*
    `,
    [lessonSessionId, learnerId, durationHours]
  );

  return result.rows[0] || null;
}

export default {
  findLessonSessionForUser,
  findLessonSessionByIdForUpdate,
  markInProgress,
  tutorConfirm,
  learnerConfirm
};