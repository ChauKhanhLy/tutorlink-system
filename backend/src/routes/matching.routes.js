const express = require('express')
const router = express.Router()

const controller = require('../controllers/matching.controller')

router.get('/', controller.getTutors)

module.exports = router