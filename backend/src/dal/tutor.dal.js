import db from '../config/db.js'

export const getTutors = async (filters = {}) => {
  let query = `
    SELECT 
      u.id,
      u.name,
      u.email,
      u.phone,
      u.avatar,
      COALESCE(tp.bio, '') as bio,
      COALESCE(tp.hourly_fee, 0) as hourly_fee,
      u.verified,
      COALESCE(tp.education, '') as education,
      COALESCE(tp.experience, '') as experience,
      COALESCE(tp.languages, '[]') as languages,
      COALESCE(tp.teaching_style, '') as teaching_style,
      COALESCE(ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL), '{}') AS subjects,
      COALESCE(AVG(r.rating), 0) AS rating,
      COUNT(DISTINCT r.id) as review_count
    FROM users u
    LEFT JOIN tutor_profiles tp ON u.id = tp.user_id
    LEFT JOIN tutor_subjects ts ON u.id = ts.tutor_id
    LEFT JOIN subjects s ON ts.subject_id = s.id
    LEFT JOIN bookings b ON u.id = b.tutor_id
    LEFT JOIN reviews r ON b.id = r.booking_id
    WHERE u.role = 'tutor'
      AND u.verified = true
  `

  const values = []

  if (filters.q) {
    values.push(`%${filters.q}%`)
    query += ` AND (u.name ILIKE $${values.length} OR COALESCE(s.name, '') ILIKE $${values.length} OR COALESCE(tp.bio, '') ILIKE $${values.length})`
  }

  if (filters.subject) {
    values.push(filters.subject)
    query += ` AND s.name = $${values.length}`
  }

  if (filters.maxPrice) {
    values.push(filters.maxPrice)
    query += ` AND COALESCE(tp.hourly_fee, 0) <= $${values.length}`
  }

  query += `
    GROUP BY u.id, u.name, u.email, u.phone, u.avatar, tp.bio, tp.hourly_fee, u.verified, tp.education, tp.experience, tp.languages, tp.teaching_style
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

export const getTutorById = async (id) => {
  const query = `
    SELECT 
      u.id,
      u.name,
      u.email,
      u.phone,
      u.avatar,
      COALESCE(tp.bio, '') as bio,
      COALESCE(tp.hourly_fee, 0) as hourly_fee,
      u.verified,
      COALESCE(tp.education, '') as education,
      COALESCE(tp.experience, '') as experience,
      COALESCE(tp.languages, '[]') as languages,
      COALESCE(tp.teaching_style, '') as teaching_style,
      COALESCE(tp.certifications, '') as certifications,
      COALESCE(ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL), '{}') AS subjects,
      COALESCE(ARRAY_AGG(DISTINCT s.id) FILTER (WHERE s.id IS NOT NULL), '{}') AS subject_ids,
      COALESCE(AVG(r.rating), 0) AS rating,
      COUNT(DISTINCT r.id) as review_count
    FROM users u
    LEFT JOIN tutor_profiles tp ON u.id = tp.user_id
    LEFT JOIN tutor_subjects ts ON u.id = ts.tutor_id
    LEFT JOIN subjects s ON ts.subject_id = s.id
    LEFT JOIN bookings b ON u.id = b.tutor_id
    LEFT JOIN reviews r ON b.id = r.booking_id
    WHERE u.id = $1 AND u.role = 'tutor'
    GROUP BY u.id, u.name, u.email, u.phone, u.avatar, tp.bio, tp.hourly_fee, u.verified, tp.education, tp.experience, tp.languages, tp.teaching_style, tp.certifications
  `
  const result = await db.query(query, [id])
  return result.rows[0]
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