const express = require('express')
const router = express.Router()

const authMiddleware = require('../middlewares/auth.middleware')
const roleMiddleware = require('../middlewares/role.middleware')
const userDAL = require('../dal/user.dal')

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

module.exports = router