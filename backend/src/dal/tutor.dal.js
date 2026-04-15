import db from '../config/db.js'

export const getTutors = async (filters = {}) => {
  let query = `
    SELECT 
      u.id,
      u.name,
      u.email,
      u.phone,
      u.avatar,
      tp.hourly_fee,
      s.name AS subject,
      COALESCE(AVG(r.rating), 0) AS rating
    FROM users u

    JOIN tutor_profiles tp ON u.id = tp.user_id
    JOIN tutor_subjects ts ON u.id = ts.tutor_id
    JOIN subjects s ON ts.subject_id = s.id

    LEFT JOIN reviews r ON u.id = r.reviewer_id

    WHERE u.role = 'tutor'
      AND u.verified = true
  `

  const values = []

  if (filters.subject) {
    values.push(filters.subject)
    query += ` AND s.name = $${values.length}`
  }

  if (filters.maxPrice) {
    values.push(filters.maxPrice)
    query += ` AND tp.hourly_fee <= $${values.length}`
  }

  query += `
    GROUP BY u.id, u.name, u.email, u.phone, u.avatar, tp.hourly_fee, s.name
  `

  if (filters.rating) {
    values.push(filters.rating)
    query += ` HAVING AVG(r.rating) >= $${values.length}`
  }

  query += `
    ORDER BY rating DESC, tp.hourly_fee ASC
  `

  const result = await db.query(query, values)
  return result.rows
}

/*const pool = require('../config/db')

export const getTutors = async (filters = {}) => {
  let query = `
    SELECT 
      u.id,
      u.name,
      u.email,
      u.phone,
      u.avatar,
      tp.hourly_fee,
      s.name AS subject,
      COALESCE(AVG(r.rating), 0) AS rating
    FROM users u

    JOIN tutor_profiles tp ON u.id = tp.user_id
    JOIN tutor_subjects ts ON u.id = ts.tutor_id
    JOIN subjects s ON ts.subject_id = s.id

    LEFT JOIN reviews r ON u.id = r.reviewer_id

    WHERE u.role = 'tutor'
      AND u.verified = true
  `

  const values = []

  if (filters.subject) {
    values.push(filters.subject)
    query += ` AND s.name = $${values.length}`
  }

  if (filters.maxPrice) {
    values.push(filters.maxPrice)
    query += ` AND tp.hourly_fee <= $${values.length}`
  }

  query += `
    GROUP BY u.id, u.name, u.email, u.phone, u.avatar, tp.hourly_fee, s.name
  `

  if (filters.rating) {
    values.push(filters.rating)
    query += ` HAVING AVG(r.rating) >= $${values.length}`
  }

  query += `
    ORDER BY rating DESC, tp.hourly_fee ASC
  `

  const result = await db.query(query, values)
  return result.rows
}*/