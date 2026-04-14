const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.put('/me', authMiddleware, userController.updateProfile)
router.post('/become-tutor', authMiddleware, userController.becomeTutor)

module.exports = router