import express from 'express'
import authMiddleware, {
  authorize
} from '../middlewares/auth.middleware.js'

import {
  getTutorAvailability,
  getTutorById,
  getTutorStats,
  updateTutorAvailability
} from '../controllers/tutor.controller.js'

const router = express.Router()

router.get(
  '/dashboard',
  authMiddleware,
  authorize('tutor'),
  (req, res) => {
    res.json({ message: "Tutor dashboard" })
  }
)

router.get(
  '/stats',
  authMiddleware,
  authorize('tutor'),
  getTutorStats
)

router.get('/:id', getTutorById)
router.get('/:id/availability', getTutorAvailability)
router.post(
  '/:id/availability',
  authMiddleware,
 authorize('tutor'),
  updateTutorAvailability
)

export default router