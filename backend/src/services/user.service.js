/*const userDAL = require('../dal/user.dal')

exports.updateProfile = async (userId, data) => {
  const user = await userDAL.findById(userId)
  if (!user) throw new Error("User not found")

  return await userDAL.updateUser(userId, data)
}

exports.becomeTutor = async (userId) => {
  const user = await userDAL.findById(userId)

  if (!user) throw new Error("User not found")

  if (user.role === 'tutor')
    throw new Error("Already a tutor")

  await userDAL.updateUser(userId, {
    role: 'tutor',
    verified: false
  })

  return { message: "Requested to become tutor" }
}

const isUUID = require('validator/lib/isUUID')

exports.verifyTutor = async (userId) => {
  //  1. Validate ID (QUAN TRỌNG)
  if (!isUUID(userId)) {
    throw new Error("Invalid user ID")
  }

  //  2. Lấy user
  const user = await userDAL.findById(userId)

  if (!user) {
    throw new Error("User not found")
  }

  //  3. Check role
  if (user.role !== 'tutor') {
    throw new Error("User is not tutor")
  }

  //  4. Check đã verify chưa
  if (user.verified) {
    throw new Error("Tutor already verified")
  }

  //  5. Update DB
  const updatedUser = await userDAL.updateUser(userId, {
    verified: true
  })

  //  6. Return (RẤT QUAN TRỌNG)
  return {
    message: "Tutor verified",
    user: updatedUser
  }
}

// pending tutor
exports.getPendingTutors = async () => {
  return await userDAL.getPendingTutors()
}*/
//import userDAL from '../dal/user.dal.js'
import * as userDAL from '../dal/user.dal.js'
import isUUID from 'validator/lib/isUUID.js'
import { saveAvailabilityPreferences } from './tutorAvailability.service.js'
import db from '../config/db.js'

// update profile
export const updateProfile = async (userId, data) => {
  const user = await userDAL.findById(userId)
  if (!user) throw new Error("User not found")

  return await userDAL.updateUser(userId, data)
}

// become tutor
export const becomeTutor = async (userId, payload = {}) => {
  const user = await userDAL.findById(userId)

  if (!user) throw new Error("User not found")

  // 1. Cập nhật bảng users (thông tin cơ bản)
  const isAlreadyTutor = user.role === 'tutor';
  const updateUserData = {
    role: 'tutor',
    verified: isAlreadyTutor ? user.verified : false,
    phone: payload.phone,
    avatar: payload.avatar
  }
  await userDAL.updateUser(userId, updateUserData)

  // 2. Cập nhật bảng tutor_profiles (thông tin chuyên sâu)
  const existingProfile = await db.query('SELECT * FROM tutor_profiles WHERE user_id = $1', [userId])
  
  const profileData = {
    bio: payload.bio,
    hourly_fee: Number(payload.hourlyRate || 0),
    education: payload.education,
    experience: payload.experience,
    languages: Array.isArray(payload.languages) ? JSON.stringify(payload.languages) : payload.languages,
    teaching_style: payload.teachingStyle,
    certifications: payload.certifications,
    verified: user.verified // Giữ nguyên trạng thái verified hiện tại của user
  }

  if (existingProfile.rows.length > 0) {
    await db.query(
      `UPDATE tutor_profiles 
       SET bio = $1, hourly_fee = $2, education = $3, experience = $4, 
           languages = $5, teaching_style = $6, certifications = $7, verified = $8 
       WHERE user_id = $9`,
      [profileData.bio, profileData.hourly_fee, profileData.education, profileData.experience, 
       profileData.languages, profileData.teaching_style, profileData.certifications, profileData.verified, userId]
    )
  } else {
    await db.query(
      `INSERT INTO tutor_profiles (user_id, bio, hourly_fee, education, experience, languages, teaching_style, certifications, verified) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [userId, profileData.bio, profileData.hourly_fee, profileData.education, profileData.experience, 
       profileData.languages, profileData.teaching_style, profileData.certifications, profileData.verified]
    )
  }

  // 3. Cập nhật bảng tutor_subjects
  if (Array.isArray(payload.subjects) && payload.subjects.length > 0) {
    await db.query('DELETE FROM tutor_subjects WHERE tutor_id = $1', [userId])
    
    for (const subjectName of payload.subjects) {
      let subjectRes = await db.query('SELECT id FROM subjects WHERE name = $1', [subjectName])
      let subjectId;
      
      if (subjectRes.rows.length === 0) {
        const newSub = await db.query(
          'INSERT INTO subjects (name) VALUES ($1) RETURNING id',
          [subjectName]
        )
        subjectId = newSub.rows[0].id
      } else {
        subjectId = subjectRes.rows[0].id
      }

      await db.query(
        'INSERT INTO tutor_subjects (tutor_id, subject_id, price) VALUES ($1, $2, $3)',
        [userId, subjectId, Number(payload.hourlyRate || 0)]
      )
    }
  }

  // 4. Lưu lịch dạy
  if (payload.schedule && Object.keys(payload.schedule).length > 0) {
    await saveAvailabilityPreferences(userId, payload.schedule)
  }

  return { message: "Requested to become tutor", savedAvailability: !!payload.schedule }
}

// verify tutor
export const verifyTutor = async (userId) => {
  if (!isUUID(userId)) {
    throw new Error("Invalid user ID")
  }

  const user = await userDAL.findById(userId)
  if (!user) throw new Error("User not found")

  if (user.role !== 'tutor')
    throw new Error("User is not tutor")

  // Update verified in BOTH tables
  await userDAL.updateUser(userId, {
    verified: true
  })

  const profileExists = await db.query('SELECT user_id FROM tutor_profiles WHERE user_id = $1', [userId])
  
  if (profileExists.rows.length > 0) {
    await db.query(
      'UPDATE tutor_profiles SET verified = true WHERE user_id = $1',
      [userId]
    )
  } else {
    // Nếu chưa có profile (có thể do dữ liệu cũ), tạo mới một profile mặc định
    await db.query(
      'INSERT INTO tutor_profiles (user_id, bio, hourly_fee, verified) VALUES ($1, $2, $3, $4)',
      [userId, 'Gia sư mới', 0, true]
    )
  }

  const updatedUser = await userDAL.findById(userId)

  return {
    message: "Tutor verified",
    user: updatedUser
  }
}

// pending tutor
export const getPendingTutors = async () => {
  return await userDAL.getPendingTutors()
}
