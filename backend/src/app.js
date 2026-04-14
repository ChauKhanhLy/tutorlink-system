const express = require('express')
const app = express()

app.use(express.json())

// routes
const authRoutes = require('./routes/auth.routes')
const tutorRoutes = require('./routes/tutor.routes')
const matchingRoutes = require('./routes/matching.routes')
const userRoutes = require('./routes/user.routes')
const adminRoutes = require('./routes/admin.routes')

app.use('/auth', authRoutes)
app.use('/tutors', tutorRoutes)
app.use('/matching', matchingRoutes)
app.use('/users',userRoutes)
app.use('/admin', adminRoutes)
// middleware
const authMiddleware = require('./middlewares/auth.middleware')

// protected
app.get('/users/me', authMiddleware, (req, res) => {
  res.json({
    message: 'User info',
    user: req.user
  })
})

module.exports = app