const pool = require('../config/db')

exports.getTutorsBySubject = async (subject) => {
  const result = await pool.query(`
    SELECT u.id, u.name, s.name AS subject
    FROM users u
    JOIN tutor_profiles tp ON u.id = tp.user_id
    JOIN tutor_subjects ts ON tp.user_id = ts.tutor_id
    JOIN subjects s ON ts.subject_id = s.id
    WHERE s.name = $1
  `, [subject])

  return result.rows
}