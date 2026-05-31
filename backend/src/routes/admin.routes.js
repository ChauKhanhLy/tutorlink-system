/*const express = require('express')
const router = express.Router()

const authMiddleware = require('../middlewares/auth.middleware')
const roleMiddleware = require('../middlewares/role.middleware')
const userDAL = require('../dal/user.dal')
const adminController = require('../controllers/admin.controller')
const { isAdmin } = require('../middlewares/auth.middleware')

// console.log("authMiddleware:", authMiddleware)
// console.log("roleMiddleware:", roleMiddleware)
// console.log("controller:", adminController.getPendingTutors)
//  xem tất cả user
router.get(
  '/users',
  authMiddleware,
  roleMiddleware('admin'),
  async (req, res) => {
    const users = await userDAL.getAllUsers()
    res.json(users)
  }
)

// duyệt tutor
router.post(
  '/verify-tutor/:id',
  authMiddleware,
  roleMiddleware('admin'),
  async (req, res) => {
    const { id } = req.params

    await userDAL.verifyTutor(id)

    res.json({ message: "Tutor verified" })
  }
)

//verify tutor
router.post('/verify-tutor/:id', authMiddleware, adminController.verifyTutor)

// pending tutor
router.get(
  '/tutors/pending',
  authMiddleware,
  roleMiddleware('admin'),
  adminController.getPendingTutors
)
module.exports = router*/
import express from 'express'
import authMiddleware, { authorize} from '../middlewares/auth.middleware.js'
//import roleMiddleware from '../middlewares/role.middleware.js'
import * as userDAL from '../dal/user.dal.js'
import { verifyTutor, getPendingTutors, getStats, getAllConversations, getAdminId ,getAllBookingsAdmin,cancelBookingAdmin} from '../controllers/admin.controller.js'
//import adminController from '../controllers/admin.controller.js'

const router = express.Router()

// stats
router.get(
  '/stats',
  authMiddleware,
  authorize(
    "admin",
    "tutor_manager"
  ),
  getStats
)

// xem tất cả user
router.get(
  '/users',
  authMiddleware,
 authorize('admin'),
  async (req, res) => {
    const users = await userDAL.getAllUsers()
    res.json(users)
  }
)

// duyệt tutor
router.post(
  '/verify-tutor/:id',
  authMiddleware,
  authorize(
    'admin',
    'tutor_manager'
  ),
  verifyTutor
)

// từ chối tutor
router.post(
  '/reject-tutor/:id',
  authMiddleware,
   authorize(
    'admin',
    'tutor_manager'
  ),
  async (req, res) => {
    const { id } = req.params
    const { reason } = req.body
    // Hiện tại chỉ đơn giản là xóa role tutor hoặc đánh dấu từ chối
    // Để đơn giản, ta chuyển role về learner
    await userDAL.updateUser(id, { role: 'learner', verified: false })
    res.json({ message: "Tutor registration rejected", reason })
  }
)

// pending tutor
router.get(
  '/tutors/pending',
  authMiddleware,
  authorize(
    "admin",
    "tutor_manager"
  ),
  getPendingTutors
)

router.get(
  '/conversations',
  authMiddleware,
 authorize(
    'admin',
    'support_staff'
  ),
  getAllConversations
);

router.get(
  "/bookings",
  authMiddleware,
  authorize(
    'admin',
    'tutor_manager'
  ),
  getAllBookingsAdmin
);
router.patch(
  "/bookings/:id/cancel",
  authMiddleware,
  authorize(
    "admin",
    "tutor_manager"
  ),
  cancelBookingAdmin
);
router.get('/id', getAdminId); // có thể không cần auth nếu public

export default router

