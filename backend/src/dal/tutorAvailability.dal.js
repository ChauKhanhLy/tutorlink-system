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
/*import db from '../config/db.js'

let isTableReady = false

const ensureTable = async () => {
  if (isTableReady) return

  await db.query(`
    CREATE TABLE IF NOT EXISTS tutor_availabilities (
      id SERIAL PRIMARY KEY,
      tutor_id UUID NOT NULL,
      day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)

  isTableReady = true
}

export const replaceTutorAvailability = async (tutorId, items = []) => {
  await ensureTable()
  await db.query('DELETE FROM tutor_availabilities WHERE tutor_id = $1', [tutorId])

  if (!items.length) return

  for (const item of items) {
    await db.query(
      `INSERT INTO tutor_availabilities (tutor_id, day_of_week, start_time, end_time, is_active)
       VALUES ($1, $2, $3, $4, TRUE)`,
      [tutorId, item.dayOfWeek, item.startTime, item.endTime]
    )
  }
}

export const getTutorAvailabilityRules = async (tutorId) => {
  await ensureTable()
  const result = await db.query(
    `SELECT day_of_week, start_time, end_time
     FROM tutor_availabilities
     WHERE tutor_id = $1 AND is_active = TRUE
     ORDER BY day_of_week ASC, start_time ASC`,
    [tutorId]
  )

  return result.rows
}*/
