import express from 'express'
import authRoutes from './routes/auth.routes.js'
import tutorRoutes from './routes/tutor.routes.js'
import matchingRoutes from './routes/matching.routes.js'
import userRoutes from './routes/user.routes.js'
import adminRoutes from './routes/admin.routes.js'
import messageRoutes from './routes/message.routes.js'
import bookingRoutes from './routes/booking.routes.js'
import reviewRoutes from './routes/review.routes.js'
import paymentRoutes from './routes/payment.routes.js'
import videoRoomRoutes from './routes/videoRoom.routes.js'
import authMiddleware, {isAdmin} from './middlewares/auth.middleware.js'

const app = express()

app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/tutors', tutorRoutes)
app.use('/api/matching', matchingRoutes)
app.use('/api/users', userRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/video-rooms', videoRoomRoutes)

app.get('/api/users/me', authMiddleware, (req, res) => {
  res.json({
    message: 'User info',
    user: req.user
  })
})

export default app
