const authService = require('../services/auth.service')

exports.register = async (req, res) => {
  try {
    await authService.register(req.body)
    res.json({ message: "User registered" })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.login = async (req, res) => {
  try {
    const result = await authService.login(req.body)
    res.json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}
const matchingService = require('../services/matching.service')

exports.getTutors = (req, res) => {
  try {
    const { subject } = req.query

    const tutors = matchingService.findTutors(subject)

    res.json({ tutors })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}