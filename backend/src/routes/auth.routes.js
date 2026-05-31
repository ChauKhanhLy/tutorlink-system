import express from 'express'
import authController from '../controllers/auth.controller.js'
import authMiddleware  from "../middlewares/auth.middleware.js";
import {
  getMe,
  verifyOTPController,
  resendOTPController,
  forgotPasswordController,
  resetPasswordController,
  changePassword,
} from "../controllers/auth.controller.js";
const router = express.Router()

router.post('/register/learner', authController.registerLearner)
router.post('/register/tutor', authController.registerTutor)
router.post('/login', authController.login)
router.get("/me", authMiddleware, getMe);
router.post('/verify-otp', verifyOTPController);
router.post(
  "/resend-otp",
  resendOTPController
);
router.post(
  "/forgot-password",
  forgotPasswordController
);

router.post(
  "/reset-password",
  resetPasswordController
);
router.put(
  "/change-password",
  authMiddleware,
  changePassword
);
export default router
