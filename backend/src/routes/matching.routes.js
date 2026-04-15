import express from 'express'
const router = express.Router()

import { getTutors } from '../controllers/matching.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'
import roleMiddleware from '../middlewares/role.middleware.js'

// PUBLIC API (KHÔNG cần login)
router.get('/', getTutors)

// PRIVATE API (có login)
router.get(
  '/personalized',
  authMiddleware,
  roleMiddleware('learner'),
  getTutors
)

export default router