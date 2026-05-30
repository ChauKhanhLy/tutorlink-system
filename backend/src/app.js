import dotenv from 'dotenv'
dotenv.config()
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
import walletRoutes from './routes/wallet.routes.js'
import authMiddleware, {isAdmin} from './middlewares/auth.middleware.js'
import complaintRoutes from './routes/complaint.routes.js'
import path from 'path';
import { fileURLToPath } from 'url';
import { findById } from './dal/user.dal.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()

import cors from 'cors';

const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json())

//app.use("/uploads", express.static("uploads"));
//app.use("/uploads", express.static(path.join(__dirname, "uploads")));
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
app.use('/api/wallet', walletRoutes)
app.use('/api/complaints', complaintRoutes);

/*app.get('/api/users/me', authMiddleware, (req, res) => {
  res.json({
    message: 'User info',
    user: req.user
  })
})*/

app.get('/api/users/me', authMiddleware, async (req, res) => {
  const user = await findById(req.user.id);

  const { password, ...userWithoutPassword } = user;

  res.json(userWithoutPassword);
});

export default app
