const express = require('express')
const app = express()

app.use(express.json())

const authRoutes = require('./routes/auth.routes')
app.use('/api', authRoutes)

const authMiddleware = require('./middlewares/auth.middleware')
app.get('/users/me', authMiddleware, (req, res) => {
  res.json({
    message: "User info",
    user: req.user
  })
})

const matchingRoutes = require('./routes/matching.routes')
app.use('/matching', matchingRoutes)

const tutorRoutes = require('./routes/tutor.routes')
app.use('/tutors', tutorRoutes)

module.exports = app