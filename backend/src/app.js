const express = require('express')
const app = express()

app.use(express.json())

// ===== ROUTES CỦA BẠN =====
const authRoutes = require('./routes/auth.routes')
const tutorRoutes = require('./routes/tutor.routes')
const matchingRoutes = require('./routes/matching.routes')
const userRoutes = require('./routes/user.routes')
const adminRoutes = require('./routes/admin.routes')
const messageRoutes = require('./routes/message.routes')

// ===== ROUTES CỦA TEAM =====
const bookingRoutes = require('./routes/booking.routes')
const reviewRoutes = require('./routes/review.routes')
const paymentRoutes = require('./routes/payment.routes')
const videoRoomRoutes = require('./routes/videoRoom.routes')

// ===== USE ROUTES =====
app.use('/api/auth', authRoutes)
app.use('/api/tutors', tutorRoutes)
app.use('/api/matching', matchingRoutes)
app.use('/api/users', userRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/messages', messageRoutes)

// thêm
app.use('/api/bookings', bookingRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/video-rooms', videoRoomRoutes)

// middleware auth
const authMiddleware = require('./middlewares/auth.middleware')

app.get('/api/users/me', authMiddleware, (req, res) => {
  res.json({
    message: 'User info',
    user: req.user
  })
})

module.exports = app
/*const express = require('express')
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

module.exports = app*/
