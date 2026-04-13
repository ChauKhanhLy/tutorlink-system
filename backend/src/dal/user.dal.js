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
exports.createUser = async ({ email, password, name}) => {
  const result = await pool.query(
    'INSERT INTO public.users (email, password, name) VALUES ($1, $2, $3) RETURNING *',
    [email, password, name]
  )
  return result.rows[0]
}

const db = require('../config/db')

// tìm user theo id
exports.findById = async (id) => {
  const result = await db.query(
    'SELECT id, email, name, phone, avatar FROM users WHERE id = $1',
    [id]
  )
  return result.rows[0]
}

// update user
exports.updateUser = async (id, { name, phone, avatar }) => {
  const result = await db.query(
    `UPDATE users
     SET name = $1,
         phone = $2,
         avatar = $3
     WHERE id = $4
     RETURNING id, email, name, phone, avatar`,
    [name, phone, avatar, id]
  )
  return result.rows[0]
}