/*const userService = require('../services/user.service')

exports.verifyTutor = async (req, res) => {
  try {
    const userId = req.params.id

    const result = await userService.verifyTutor(userId)

    res.json(result)
  } catch (err) {
    res.status(400).json({
      message: err.message
    })
  }
}

// pending tutor
exports.getPendingTutors = async (req, res) => {
  try {
    const tutors = await userService.getPendingTutors()
    res.json(tutors)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}*/
//import userService from '../services/user.service.js'
import { verifyTutor as verifyTutorService, getPendingTutors as getPendingTutorsService } from '../services/user.service.js'


export const verifyTutor = async (req, res) => {
  try {
    const userId = req.params.id
    const result = await verifyTutorService(userId)
    res.json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getPendingTutors = async (req, res) => {
  try {
    const tutors = await getPendingTutorsService()
    res.json({
      message: "Pending tutors",
      data: tutors
    })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getStats = async (req, res) => {
  try {
    // Mock stats for now
    res.json({
      message: "Admin stats",
      data: {
        total_learners: 150,
        total_tutors: 45,
        total_bookings: 320,
        total_revenue: 12500
      }
    })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}
