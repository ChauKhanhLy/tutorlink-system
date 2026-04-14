const express = require('express')
const router = express.Router()

const authMiddleware = require('../middlewares/auth.middleware')
const roleMiddleware = require('../middlewares/role.middleware')

router.get(
  '/dashboard',
  authMiddleware,
  roleMiddleware('tutor'),   // hỉ tutor
  (req, res) => {
    res.json({ message: "Tutor dashboard" })
  }
)

module.exports = router