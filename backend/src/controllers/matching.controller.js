const matchingService = require('../services/matching.service')

exports.getTutors = async (req, res) => {
  const subject = req.query.subject

  try {
    const tutors = await matchingService.getTutors(subject)
    res.json(tutors)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}