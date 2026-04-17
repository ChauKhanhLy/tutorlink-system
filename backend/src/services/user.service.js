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

  const updateData = {
    role: 'tutor',
    verified: false,
    phone: payload.phone,
    subjects: payload.subjects,
    hourly_rate: Number(payload.hourlyRate || 0),
    education: payload.education,
    experience: payload.experience,
    certifications: payload.certifications,
    bio: payload.bio,
    languages: payload.languages,
    teaching_style: payload.teachingStyle
  }

  await userDAL.updateUser(userId, updateData)

  if (Array.isArray(payload.availability)) {
    await saveAvailabilityPreferences(userId, payload.availability, payload.availableDays || [])
  }

  return { message: "Requested to become tutor", savedAvailability: Array.isArray(payload.availability) }
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

  if (user.verified)
    throw new Error("Tutor already verified")

  const updatedUser = await userDAL.updateUser(userId, {
    verified: true
  })

  return {
    message: "Tutor verified",
    user: updatedUser
  }
}

// pending tutor
export const getPendingTutors = async () => {
  return await userDAL.getPendingTutors()
}
