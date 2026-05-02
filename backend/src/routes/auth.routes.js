import express from 'express'
import authController from '../controllers/auth.controller.js'

const router = express.Router()

router.post('/register/learner', authController.registerLearner)
router.post('/register/tutor', authController.registerTutor)
router.post('/login', authController.login)

export default router
