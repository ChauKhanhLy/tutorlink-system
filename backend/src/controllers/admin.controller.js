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

    const result = await userService.verifyTutor(userId)

    res.json(result)
  } catch (err) {
    res.status(400).json({
      message: err.message
    })
  }
}

// pending tutor
export const getPendingTutors = async (req, res) => {
  try {
    const tutors = await userService.getPendingTutors()
    res.json(tutors)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}
