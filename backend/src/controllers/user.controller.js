import { updateProfile as updateProfileService, becomeTutor as becomeTutorService } from '../services/user.service.js'
import { findById } from '../dal/user.dal.js'

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params
    const user = await findById(id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    // Không trả về password
    const { password, ...userWithoutPassword } = user
    if (userWithoutPassword.avatar) {
      userWithoutPassword.avatar = `${BASE_URL}${userWithoutPassword.avatar}`
    }
    //
    res.json(userWithoutPassword)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const { name, phone, avatar } = req.body

    const updatedUser = await updateProfileService(userId, {
      name,
      phone,
      avatar
    })
    //  FIX AVATAR SAU UPDATE
    const userWithAvatar = {
      ...updatedUser,
      avatar: updatedUser.avatar
        ? `${BASE_URL}${updatedUser.avatar}`
        : null
    }
    res.json({
      message: "Update profile success",
      user: updatedUser,
      
    })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const becomeTutor = async (req, res) => {
  try {
    const userId = req.user.id
    const payload = req.body || {}

    const result = await becomeTutorService(userId, payload)

    res.json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

/*const userService = require('../services/user.service')

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id   // lấy từ JWT
    const { name, phone, avatar } = req.body

    const updatedUser = await userService.updateProfile(userId, {
      name,
      phone,
      avatar
    })

    res.json({
      message: "Update profile success",
      user: updatedUser
    })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.becomeTutor = async (req, res) => {
  try {
    const userId = req.user.id

    const result = await userService.becomeTutor(userId)

    res.json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}*/