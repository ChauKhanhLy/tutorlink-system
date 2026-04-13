const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.put('/me', authMiddleware, userController.updateProfile)

module.exports = router