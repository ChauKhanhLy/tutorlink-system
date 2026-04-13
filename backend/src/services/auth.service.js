const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const userDAL = require('../dal/user.dal')


if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined")
}

const SECRET = process.env.JWT_SECRET

exports.register = async ({ email, password }) => {
  const existingUser = await userDAL.findByEmail(email)

  if (existingUser) throw new Error("User already exists")

  const hashedPassword = await bcrypt.hash(password, 10)

  return await userDAL.createUser({
    email,
    password: hashedPassword
  })
}

exports.login = async ({ email, password }) => {
  const user = await userDAL.findByEmail(email)

  if (!user) throw new Error("User not found")

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) throw new Error("Wrong password")

  const token = jwt.sign(
    { id: user.id, role: user.role },
    SECRET,
    { expiresIn: '1h' }
  )

  return { token, user }
}