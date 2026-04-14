const express = require('express')
const router = express.Router()

const matchingController = require('../controllers/matching.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const roleMiddleware = require('../middlewares/role.middleware')

router.get(
  '/',
  authMiddleware,
  roleMiddleware('learner'),   //  chỉ learner được gọi
  matchingController.getMatching
)

module.exports = router