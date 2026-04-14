import express from 'express'
import { getTutors } from '../controllers/matching.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'
import roleMiddleware from '../middlewares/role.middleware.js'

const router = express.Router()

router.get(
  '/',
  authMiddleware,
  roleMiddleware('learner'),
  getTutors
)

export default router

/*const express = require('express')
const router = express.Router()

const matchingController = require('../controllers/matching.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const roleMiddleware = require('../middlewares/role.middleware')

router.get(
  '/',
  authMiddleware,
  roleMiddleware('learner'),
  matchingController.getTutors   
)

module.exports = router*/