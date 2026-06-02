import express from 'express'
import {  becomeTutor, getUserById,updateProfileInfo,updateLearningInfo} from '../controllers/user.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/upload.middlewares.js'
import { updateAvatar } from '../controllers/user.controller.js'
import {
  changePassword
} from "../controllers/user.controller.js";
const router = express.Router()
router.get('/:id', getUserById)
router.post('/become-tutor', authMiddleware, becomeTutor)
router.post(
  '/avatar',
  authMiddleware,
  upload.single('avatar'),
  updateAvatar
)
router.put(
  "/me/profile",
  authMiddleware,
  updateProfileInfo
);

router.put(
  "/me/learning",
  authMiddleware,
  updateLearningInfo
);
router.put(
  "/change-password",
  authMiddleware,
  changePassword
);
export default router

/*const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.put('/me', authMiddleware, userController.updateProfile)
router.post('/become-tutor', authMiddleware, userController.becomeTutor)

module.exports = router*/