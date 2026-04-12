import express from 'express';
import {postBooking} from '../controllers/booking.controller.js';
import { getBookings } from '../services/booking.service.js';
/*import {authMiddleware} from '../middlewares/auth.js';*/

const router = express.Router();
/*router.post ('/', authMiddleware, postBooking);*/
router.post('/', postBooking);
router.get('/', getBookings);

export default router;