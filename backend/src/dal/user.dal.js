import db from '../config/db.js'

// tìm user theo email
export const findByEmail = async (email) => {
  const result = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  )
  return result.rows[0]
}

// tạo user
export const createUser = async ({
  email,
  password,
  name,
  role,
  verified,
  email_verified,
  otp_code,
  otp_expires
}) => {

  const result = await db.query(
    `
    INSERT INTO users (
      email,
      password,
      name,
      role,
      verified,
      email_verified,
      otp_code,
      otp_expires
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *
    `,
    [
      email,
      password,
      name,
      role,
      verified,
      email_verified,
      otp_code,
      otp_expires
    ]
  );

  console.log("USER CREATED:", result.rows[0])

  return result.rows[0]
}
// lấy tất cả user
export const getAllUsers = async () => {
  const result = await db.query(
    'SELECT id, email, name, role, verified FROM users'
  )
  return result.rows
}

// tìm user theo id
export const findById = async (id) => {
  const result = await db.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  )
  return result.rows[0]
}

// update user (dùng chung cho nhiều mục đích)
export const updateUser = async (id, data) => {
  const fields = []
  const values = []
  let index = 1

  for (let key in data) {
    fields.push(`${key} = $${index}`)
    values.push(data[key])
    index++
  }

  values.push(id)

  const query = `
    UPDATE users
    SET ${fields.join(', ')}
    WHERE id = $${index}
    RETURNING *
  `

  const result = await db.query(query, values)
  return result.rows[0]
}

// verify tutor
export const verifyTutor = async (id) => {
  await db.query(
    'UPDATE users SET verified = true WHERE id = $1',
    [id]
  )
}

// pending tutors
export const getPendingTutors = async () => {
  const result = await db.query(`
    SELECT id, email, name, role, verified
    FROM users
    WHERE role = 'tutor' AND verified = false
  `)
  return result.rows
}

/*const pool = require('../config/db')

// tìm user theo email
exports.findByEmail = async (email) => {
  const result = await pool.query(
    'SELECT * FROM public.users WHERE email = $1',
    [email]
  )
  return result.rows[0]
}

// tạo user
exports.createUser = async ({ email, password, name, role}) => {
  const result = await pool.query(
    'INSERT INTO public.users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING *',
    [email, password, name, role]
  )
  return result.rows[0]
}

exports.getAllUsers = async () => {
  const result = await pool.query(
    'SELECT id, email, name, role, verified FROM users'
  )
  return result.rows
}

exports.verifyTutor = async (id) => {
  await pool.query(
    'UPDATE users SET verified = true WHERE id = $1',
    [id]
  )
}

const db = require('../config/db')

// tìm user theo id
exports.findById = async (id) => {
  const result = await db.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  )
  return result.rows[0]
}
//update user (admin verify user)
exports.updateUser = async (id, data) => {
  const fields = []
  const values = []
  let index = 1

  for (let key in data) {
    fields.push(`${key} = $${index}`)
    values.push(data[key])
    index++
  }

  values.push(id)

  const query = `
    UPDATE users
    SET ${fields.join(', ')}
    WHERE id = $${index}
    RETURNING *
  `

  const result = await db.query(query, values)
  return result.rows[0]
}

// update proFileUser
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

//become tutor
exports.updateUser = async (id, data) => {
  const fields = []
  const values = []
  let index = 1

  for (let key in data) {
    fields.push(`${key} = $${index}`)
    values.push(data[key])
    index++
  }

  values.push(id)

  const query = `
    UPDATE users
    SET ${fields.join(', ')}
    WHERE id = $${index}
    RETURNING *
  `

  const result = await db.query(query, values)
  return result.rows[0]
}

// pendingTutors
exports.getPendingTutors = async () => {
  const result = await db.query(`
    SELECT id, email, name, role, verified
    FROM users
    WHERE role = 'tutor' AND verified = false
  `)
  return result.rows
}
*/