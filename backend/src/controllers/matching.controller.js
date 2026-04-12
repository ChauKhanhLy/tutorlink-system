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