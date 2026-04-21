import express from 'express'
import { updateProfile, becomeTutor, getUserById } from '../controllers/user.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/:id', getUserById)
router.put('/me', authMiddleware, updateProfile)
router.post('/become-tutor', authMiddleware, becomeTutor)

export default router

/*const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.put('/me', authMiddleware, userController.updateProfile)
router.post('/become-tutor', authMiddleware, userController.becomeTutor)

module.exports = router*/