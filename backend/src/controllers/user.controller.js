import { updateProfile as updateProfileService, becomeTutor as becomeTutorService } from '../services/user.service.js'

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const { name, phone, avatar } = req.body

    const updatedUser = await updateProfileService(userId, {
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

export const becomeTutor = async (req, res) => {
  try {
    const userId = req.user.id

    const result = await becomeTutorService(userId)

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