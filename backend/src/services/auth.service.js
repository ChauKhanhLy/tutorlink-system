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
const pendingUsers = new Map();
const resetPasswordRequests =
  new Map();

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
  const pendingUser =
  pendingUsers.get(email);

if (
  pendingUser &&
  new Date() <
  new Date(pendingUser.otp_expires)
) {
  throw new Error(
    "OTP already sent. Please verify your email."
  );
}

  const hashedPassword =
    await bcrypt.hash(password, 10);

  const otp =
    Math.floor(
      100000 + Math.random() * 900000
    ).toString();

  const otpExpires =
    new Date(Date.now() + 60 * 1000);

  // Save temp user
  pendingUsers.set(email, {
  email,
  password: hashedPassword,
  name,

  role: 'learner',

  verified: true,

  email_verified: false,

  otp_code: otp,
  otp_expires: otpExpires,
});
setTimeout(() => {
  pendingUsers.delete(email);
}, 5 * 60 * 1000);

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
    const pendingUser =
  pendingUsers.get(email);

if (
  pendingUser &&
  new Date() <
  new Date(pendingUser.otp_expires)
) {
  throw new Error(
    "OTP already sent. Please verify your email."
  );
}

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
    new Date(Date.now() + 60 * 1000);

  // SAVE TEMP USER
  pendingUsers.set(email, {
    email,
    password: hashedPassword,
    name,

    role: 'tutor',

    verified: false,

    email_verified: false,

    otp_code: otp,
    otp_expires: otpExpires,
  });

  setTimeout(() => {
  pendingUsers.delete(email);
},  5 * 60 * 1000);

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
 
  // GET TEMP USER
  const pendingUser =
    pendingUsers.get(email);

  console.log("PENDING USER:", pendingUser)

  if (!pendingUser) {
    throw new Error(
      "Registration expired"
    );
  }

  console.log(
    "MAP OTP:",
    pendingUser.otp_code
  )

  if (
    String(pendingUser.otp_code).trim() !==
    String(otp).trim()
  ) {
    throw new Error("Invalid OTP");
  }

  if (
    new Date() >
    new Date(pendingUser.otp_expires)
  ) {
    throw new Error("OTP expired");
  }

  // CREATE REAL USER
  const createdUser =
    await userDAL.createUser({

      email: pendingUser.email,

      password:
        pendingUser.password,

      name:
        pendingUser.name,

      role:
        pendingUser.role,

      verified:
        pendingUser.verified,

      email_verified: true,

      otp_code: null,

      otp_expires: null,
    });

  // DELETE TEMP USER
  pendingUsers.delete(email);

  return createdUser;
}
export const resendOTP =
async (email) => {

  const pendingUser =
    pendingUsers.get(email);

  if (!pendingUser) {
    throw new Error(
      "Registration expired"
    );
  }

  const otp =
    Math.floor(
      100000 + Math.random() * 900000
    ).toString();

  pendingUser.otp_code = otp;

  pendingUser.otp_expires =
    new Date(Date.now() + 60 * 1000);

  pendingUsers.set(
    email,
    pendingUser
  );

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "TutorLink OTP",
    html: `
      <h1>Your OTP: ${otp}</h1>
    `,
  });

  return {
    message:
      "OTP resent successfully"
  };
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
      verified: user.verified,
      email_verified: user.email_verified
    }
  }
}
export const forgotPassword =
async (email) => {

  const user =
    await userDAL.findByEmail(email);

  if (!user) {
    throw new Error(
      "User not found"
    );
  }

  const otp =
    Math.floor(
      100000 + Math.random() * 900000
    ).toString();

  const otpExpires =
    new Date(Date.now() + 60 * 1000);

  resetPasswordRequests.set(
    email,
    {
      otp,
      otpExpires
    }
  );

  setTimeout(() => {
    resetPasswordRequests.delete(email);
  }, 5 * 60 * 1000);

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject:
      "TutorLink Reset Password OTP",

    html: `
      <h1>Your OTP: ${otp}</h1>
    `,
  });

  return {
    message:
      "Reset OTP sent successfully"
  };
}
export const resetPassword =
async ({
  email,
  otp,
  newPassword
}) => {

  const resetRequest =
    resetPasswordRequests.get(email);

  if (!resetRequest) {
    throw new Error(
      "Reset request expired"
    );
  }

  if (
    String(resetRequest.otp).trim() !==
    String(otp).trim()
  ) {
    throw new Error("Invalid OTP");
  }

  if (
    new Date() >
    new Date(resetRequest.otpExpires)
  ) {
    throw new Error("OTP expired");
  }

  const hashedPassword =
    await bcrypt.hash(
      newPassword,
      10
    );

  const user =
    await userDAL.findByEmail(email);

  await userDAL.updateUser(
    user.id,
    {
      password:
        hashedPassword
    }
  );

  resetPasswordRequests.delete(email);

  return {
    message:
      "Password reset successful"
  };
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