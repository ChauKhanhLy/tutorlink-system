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