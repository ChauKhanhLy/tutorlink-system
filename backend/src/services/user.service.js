const userDAL = require('../dal/user.dal')

exports.updateProfile = async (userId, data) => {
  const user = await userDAL.findById(userId)
  if (!user) throw new Error("User not found")

  return await userDAL.updateUser(userId, data)
}