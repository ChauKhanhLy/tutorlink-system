const matchingService = require('../services/matching.service')

// 🎯 API MATCHING CHÍNH
exports.getTutors = async (req, res) => {
  try {
    const filters = req.query   // subject, price, rating...

    const tutors = await matchingService.getTutors(filters)

    res.json({
      message: "Matching tutors",
      tutors
    })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}