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

  await db.query(`
    ALTER TABLE tutor_availabilities
    ALTER COLUMN day_of_week DROP NOT NULL
  `)

  await db.query(`
    ALTER TABLE tutor_availabilities
    ADD COLUMN IF NOT EXISTS specific_date DATE
  `)

  isTableReady = true
}

export const replaceTutorAvailability = async (tutorId, items = []) => {
  await ensureTable();
  console.log('replaceTutorAvailability: tutorId =', tutorId, 'items count =', items.length);

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    //await client.query('DELETE FROM tutor_availabilities WHERE tutor_id = $1', [tutorId]);
    console.log('Deleted old availabilities for tutor', tutorId);

    if (items.length) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        console.log(`Inserting item ${i}:`, item);
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
      console.log(`Inserted ${items.length} records`);
    }
    await client.query('COMMIT');
    console.log('Transaction committed');
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
/*export const saveAvailabilityPreferences = async (tutorId, payload) => {
  console.log('saveAvailabilityPreferences called with:', { tutorId, payload });
  const { dates = [], repeatWeekly = false } = payload || {};
  console.log('dates:', dates, 'repeatWeekly:', repeatWeekly);

  const normalized = [];

  for (const item of dates) {
    const dateObj = new Date(item.date);
    const dayOfWeek = dateObj.getDay();
    for (const time of item.times || []) {
      normalized.push({
        dayOfWeek: repeatWeekly ? dayOfWeek : null,
        specificDate: repeatWeekly ? null : item.date,
        startTime: normalizeTime(time),
        endTime: addOneHour(time),
      });
    }
  }

  console.log('Normalized data to save:', JSON.stringify(normalized, null, 2));
  await replaceTutorAvailability(tutorId, normalized);
};
import db from '../config/db.js'

let isTableReady = false

const ensureTable = async () => {
  if (isTableReady) return

  await db.query(`
    CREATE TABLE IF NOT EXISTS tutor_availabilities (
      id SERIAL PRIMARY KEY,
      tutor_id UUID NOT NULL,

      -- recurring weekly
      day_of_week SMALLINT CHECK (day_of_week BETWEEN 0 AND 6),

      -- specific date
      specific_date DATE,

      start_time TIME NOT NULL,
      end_time TIME NOT NULL,

      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)

  // 🔥 thêm cột specific_date nếu chưa có
  await db.query(`
    ALTER TABLE tutor_availabilities
    ADD COLUMN IF NOT EXISTS specific_date DATE
  `)

  // 🔥 bỏ NOT NULL của day_of_week
  await db.query(`
    ALTER TABLE tutor_availabilities
    ALTER COLUMN day_of_week DROP NOT NULL
  `)

  isTableReady = true
}

export const replaceTutorAvailability = async (
  tutorId,
  items = []
) => {
  await ensureTable()

  await db.query(
    'DELETE FROM tutor_availabilities WHERE tutor_id = $1',
    [tutorId]
  )

  if (!items.length) return

  for (const item of items) {
    await db.query(
      `
      INSERT INTO tutor_availabilities (
        tutor_id,
        day_of_week,
        specific_date,
        start_time,
        end_time,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, TRUE)
      `,
      [
        tutorId,
        item.dayOfWeek ?? null,
        item.specificDate ?? null,
        item.startTime,
        item.endTime,
      ]
    )
  }
}

export const getTutorAvailabilityRules = async (
  tutorId
) => {
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
    WHERE tutor_id = $1
      AND is_active = TRUE
    ORDER BY
      specific_date ASC NULLS LAST,
      day_of_week ASC NULLS LAST,
      start_time ASC
    `,
    [tutorId]
  )

  return result.rows.map((row) => ({
    id: row.id,

    // recurring weekly
    dayOfWeek: row.day_of_week,

    // exact date
    specificDate: row.specific_date,

    startTime: row.start_time,
    endTime: row.end_time,
  }))
}
*/