const userDAL = require('../dal/user.dal')

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
}