import express from 'express'
import authController from '../controllers/auth.controller.js'

const router = express.Router()
// REGISTER
router.post('/register-learner', authController.registerLearner)
router.post('/register-tutor', authController.registerTutor)

// LOGIN
router.post('/login-learner', authController.loginLearner)
router.post('/login-tutor', authController.loginTutor)
export default router
