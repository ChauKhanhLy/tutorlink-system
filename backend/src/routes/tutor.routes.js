import express from 'express'
import authMiddleware from '../middlewares/auth.middleware.js'
import roleMiddleware from '../middlewares/role.middleware.js'
import { 
  getTutorAvailability, 
  getTutorById, 
  getTutorStats,
  getMyAvailabilityPreferences,
  updateMyAvailability 
} from '../controllers/tutor.controller.js'

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

// Đặt /me lên trước /:id để không bị nhầm lẫn route params
router.get(
  '/me/availability-preferences',
  authMiddleware,
  roleMiddleware('tutor'),
  getMyAvailabilityPreferences
)

router.put(
  '/me/availability',
  authMiddleware,
  roleMiddleware('tutor'),
  updateMyAvailability
)

router.get('/:id', getTutorById)
router.get('/:id/availability', getTutorAvailability)

export default router
