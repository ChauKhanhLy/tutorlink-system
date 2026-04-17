import express from 'express'
import authMiddleware from '../middlewares/auth.middleware.js'
import roleMiddleware from '../middlewares/role.middleware.js'
import { getTutorAvailability } from '../controllers/tutor.controller.js'

const router = express.Router()

router.get(
  '/dashboard',
  authMiddleware,
  roleMiddleware('tutor'),
  (req, res) => {
    res.json({ message: "Tutor dashboard" })
  }
)

router.get('/:id/availability', getTutorAvailability)

export default router

/*const express = require('express')
const router = express.Router()

const authMiddleware = require('../middlewares/auth.middleware')
const roleMiddleware = require('../middlewares/role.middleware')

router.get(
  '/dashboard',
  authMiddleware,
  roleMiddleware('tutor'),   // chỉ tutor
  (req, res) => {
    res.json({ message: "Tutor dashboard" })
  }
)

module.exports = router*/