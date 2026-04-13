import express from 'express';
/*import {postBooking} from '../controllers/booking.controller.js';
import { getBookings } from '../services/booking.service.js';
/*import {authMiddleware} from '../middlewares/auth.js';*/
import { postBooking, getMyBookings, payBooking } from '../controllers/booking.controller.js';

const router = express.Router();
/*router.post ('/', authMiddleware, postBooking);*/
router.post('/', postBooking);
router.get('/', getMyBookings);
router.put('/:id/pay', payBooking);

export default router;