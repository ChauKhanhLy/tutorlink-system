import express from 'express'
import authMiddleware from '../middlewares/auth.middleware.js'
import roleMiddleware from '../middlewares/role.middleware.js'
import { getTutorAvailability, getTutorById, getTutorStats, updateTutorAvailability } from '../controllers/tutor.controller.js'

const router = express.Router()

router.get(
  '/dashboard',
  authMiddleware,
  roleMiddleware('tutor'),
  (req, res) => {
    res.json({ message: "Tutor dashboard" })
  }
)

router.get(
  '/stats',
  authMiddleware,
  roleMiddleware('tutor'),
  getTutorStats
)

router.get('/:id', getTutorById)
router.get('/:id/availability', getTutorAvailability)
router.post(
  '/:id/availability',
  authMiddleware,
  roleMiddleware('tutor'),
  updateTutorAvailability
)

export default router
