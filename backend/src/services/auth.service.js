/*import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import * as userDAL from '../dal/user.dal.js'

const SECRET = process.env.JWT_SECRET

if (!SECRET) {
  throw new Error("JWT_SECRET is not defined")
}

// ================= REGISTER =================
export const register = async ({ email, password, name, role }) => {
  const existingUser = await userDAL.findByEmail(email)

  if (existingUser) throw new Error("User already exists")

  const hashedPassword = await bcrypt.hash(password, 10)

  return await userDAL.createUser({
    email,
    password: hashedPassword,
    name,
    role: role || 'learner', // 👈 tách role ở đây
    verified: role === 'tutor' ? false : true // 👈 tutor phải chờ duyệt
  })
}

// ================= LOGIN =================
export const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Missing email or password")
  }

  const user = await userDAL.findByEmail(email)
  if (!user) throw new Error("User not found")

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) throw new Error("Wrong password")

  // 🔥 CHẶN tutor chưa verify
  if (user.role === 'tutor' && user.verified === false) {
    throw new Error("Tutor chưa được duyệt")
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    SECRET,
    { expiresIn: '24h' }
  )

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      verified: user.verified // 👈 thêm để frontend biết trạng thái
    }
  }
}
*/
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import * as userDAL from '../dal/user.dal.js'

import { transporter } from "./mail.service.js";
const SECRET = process.env.JWT_SECRET
//const pendingUsers = new Map();
if (!SECRET) {
  throw new Error("JWT_SECRET is not defined")
}


// register learner
export const registerLearner = async ({
  email,
  password,
  name
}) => {

  const existingUser =
    await userDAL.findByEmail(email);

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword =
    await bcrypt.hash(password, 10);

  const otp =
    Math.floor(
      100000 + Math.random() * 900000
    ).toString();

  const otpExpires =
    new Date(Date.now() + 5 * 60 * 1000);

  await userDAL.createUser({
    email,
    password: hashedPassword,
    name,

    role: 'learner',

    verified: true,

    email_verified: false,

    otp_code: otp,
    otp_expires: otpExpires,
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "TutorLink OTP",
    html: `
      <h1>Your OTP: ${otp}</h1>
    `,
  });

  return {
    message: "OTP sent successfully"
  };
}


// register tutor
export const registerTutor = async ({
  email,
  password,
  name
}) => {

  const existingUser =
    await userDAL.findByEmail(email);

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword =
    await bcrypt.hash(password, 10);

  const otp =
    Math.floor(
      100000 + Math.random() * 900000
    ).toString();

  const otpExpires =
    new Date(Date.now() + 5 * 60 * 1000);

  await userDAL.createUser({
    email,
    password: hashedPassword,
    name,

    role: 'tutor',

    verified: false,

    email_verified: false,

    otp_code: otp,
    otp_expires: otpExpires,
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "TutorLink OTP",
    html: `
      <h1>Your OTP: ${otp}</h1>
    `,
  });

  return {
    message: "OTP sent successfully"
  };
}

// verify OTP
/*export const verifyOTP = async ({
  email,
  otp
}) => {

  const user =
    await userDAL.findByEmail(email);

  if (!user)
    throw new Error("User not found");

  if (user.otp_code !== otp)
    throw new Error("Invalid OTP");

  if (
    new Date() >
    new Date(user.otp_expires)
  ) {
    throw new Error("OTP expired");
  }

  const updatedUser =
    await userDAL.updateUser(user.id, {
      email_verified: true,
      otp_code: null,
      otp_expires: null,
    });

  return updatedUser;
}*/
export const verifyOTP = async ({
  email,
  otp
}) => {

  console.log("EMAIL:", email)
  console.log("INPUT OTP:", otp)

  const user =
    await userDAL.findByEmail(email);

  console.log("USER:", user)

  if (!user)
    throw new Error("User not found");

  console.log("DB OTP:", user.otp_code)

  if (
    String(user.otp_code).trim() !==
    String(otp).trim()
  ) {
    throw new Error("Invalid OTP");
  }

  if (
    new Date() >
    new Date(user.otp_expires)
  ) {
    throw new Error("OTP expired");
  }

  const updatedUser =
    await userDAL.updateUser(user.id, {
      email_verified: true,
      otp_code: null,
      otp_expires: null,
    });

  return updatedUser;
}
// login
export const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Missing email or password")
  }

  const user = await userDAL.findByEmail(email)
  if (!user) throw new Error("User not found")

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) throw new Error("Wrong password")

  const token = jwt.sign(
    { id: user.id, role: user.role },
    SECRET,
    { expiresIn: '24h' }
  )

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      //verif
    }
  }
}

/*const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const userDAL = require('../dal/user.dal')

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined")
}

const SECRET = process.env.JWT_SECRET

exports.register = async ({ email, password, name }) => {
  const existingUser = await userDAL.findByEmail(email)

  if (existingUser) throw new Error("User already exists")

  const hashedPassword = await bcrypt.hash(password, 10)

  return await userDAL.createUser({
    email,
    password: hashedPassword,
    name,
    role: 'learner'
  })
}

exports.login = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Missing email or password")
  }

  const user = await userDAL.findByEmail(email)
  if (!user) throw new Error("User not found")

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) throw new Error("Wrong password")

  const token = jwt.sign(
    { id: user.id, role: user.role },
    SECRET,
    { expiresIn: '1h' }
  )

   return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  }
}*/