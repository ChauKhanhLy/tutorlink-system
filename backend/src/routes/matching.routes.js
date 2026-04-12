const express = require('express')
const router = express.Router()
const matchingController = require('../controllers/matching.controller')

router.get('/tutors', matchingController.getTutors)

module.exports = router