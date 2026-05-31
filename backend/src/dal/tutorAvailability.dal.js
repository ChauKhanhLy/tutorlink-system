import db from '../config/db.js'

let isTableReady = false

const ensureTable = async () => {
  if (isTableReady) return

  await db.query(`
    CREATE TABLE IF NOT EXISTS tutor_availabilities (
      id SERIAL PRIMARY KEY,
      tutor_id UUID NOT NULL,
      day_of_week SMALLINT,
      specific_date DATE,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)

  // Đảm bảo các cột cần thiết tồn tại (migration script mini)
  await db.query(`
    ALTER TABLE tutor_availabilities
    ALTER COLUMN day_of_week DROP NOT NULL
  `).catch(() => {});

  await db.query(`
    ALTER TABLE tutor_availabilities
    ADD COLUMN IF NOT EXISTS specific_date DATE
  `).catch(() => {});

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_tutor_availabilities_tutor_id
    ON tutor_availabilities (tutor_id)
  `)

  isTableReady = true
}

export const replaceTutorAvailability = async (tutorId, items = []) => {
  await ensureTable();
  console.log('saveTutorAvailability: tutorId =', tutorId, 'items count =', items.length);

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `DELETE FROM tutor_availabilities
       WHERE tutor_id = $1
         AND specific_date IS NOT NULL
         AND specific_date < CURRENT_DATE`,
      [tutorId]
    );
    console.log('Deleted past availabilities for tutor', tutorId);

    if (items.length) {
      for (const item of items) {
        await client.query(
          `DELETE FROM tutor_availabilities
           WHERE tutor_id = $1
             AND COALESCE(day_of_week, -1) = COALESCE($2::smallint, -1)
             AND COALESCE(specific_date, DATE '1900-01-01') = COALESCE($3::date, DATE '1900-01-01')
             AND start_time = $4
             AND end_time = $5`,
          [
            tutorId,
            item.dayOfWeek ?? null,
            item.specificDate ?? null,
            item.startTime,
            item.endTime
          ]
        );

        await client.query(
          `INSERT INTO tutor_availabilities 
           (tutor_id, day_of_week, specific_date, start_time, end_time, is_active)
           VALUES ($1, $2, $3, $4, $5, TRUE)`,
          [
            tutorId,
            item.dayOfWeek ?? null,
            item.specificDate ?? null,
            item.startTime,
            item.endTime
          ]
        );
      }
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in replaceTutorAvailability:', err);
    throw err;
  } finally {
    client.release();
  }
};

export const getTutorAvailabilityRules = async (tutorId) => {
  await ensureTable()

  const result = await db.query(
    `
    SELECT
      id,
      day_of_week,
      specific_date,
      start_time,
      end_time
    FROM tutor_availabilities
    WHERE tutor_id = $1 AND is_active = TRUE
    ORDER BY
      specific_date ASC NULLS LAST,
      day_of_week ASC NULLS LAST,
      start_time ASC
    `,
    [tutorId]
  )

  return result.rows.map((row) => ({
    id: row.id,
    dayOfWeek: row.day_of_week,
    specificDate: row.specific_date,
    startTime: row.start_time,
    endTime: row.end_time,
  }))
}
