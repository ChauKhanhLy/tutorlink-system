const matchingService = require('../services/matching.service')

exports.getMatching = async (req, res) => {
  try {
    const learnerId = req.user.id   // lấy từ token

    const tutors = await matchingService.getMatching(learnerId)

    res.json({
      message: "Matching tutors",
      tutors
    })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.getTutors = async (req, res) => {
  const subject = req.query.subject

  try {
    const tutors = await matchingService.getTutors(subject)
    res.json(tutors)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}