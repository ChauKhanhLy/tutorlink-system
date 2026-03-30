import express from 'express';
import {postBooking} from '../controllers/booking.controller.js';
import {authMiddleware} from '../middlewares/auth.js';

const router = express.Router();
router.post ('/', authMiddleware, postBooking);

export default router;