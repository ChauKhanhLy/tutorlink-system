const pool = require('../config/db')

// tìm user theo email
exports.findByEmail = async (email) => {
  const result = await pool.query(
    'SELECT * FROM public.users WHERE email = $1',
    [email]
  )
  return result.rows[0]
}

// tạo user
exports.createUser = async ({ email, password }) => {
  const result = await pool.query(
    'INSERT INTO public.users (email, password) VALUES ($1, $2) RETURNING *',
    [email, password]
  )
  return result.rows[0]
}