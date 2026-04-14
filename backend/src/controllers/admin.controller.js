const userService = require('../services/user.service')

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
}