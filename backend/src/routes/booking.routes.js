/*import express from 'express';
/*import {postBooking} from '../controllers/booking.controller.js';
import { getBookings } from '../services/booking.service.js';
/*import {authMiddleware} from '../middlewares/auth.js';
import { postBooking, getMyBookings, payBooking } from '../controllers/booking.controller.js';

const router = express.Router();
/*router.post ('/', authMiddleware, postBooking);
router.post('/', postBooking);
router.get('/', getMyBookings);
router.put('/:id/pay', payBooking);

export default router;

router.get('/tutor/:tutor_id', async (req, res) => {
    try {
        const data = await BookingService.getBookingsForTutor(req.params.tutor_id);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});*/
import express from 'express'
import {
  postBooking,
  getMyBookings,
  payBooking
} from '../controllers/booking.controller.js'
import * as BookingService from '../services/booking.service.js'

const router = express.Router()

router.post('/', postBooking)
router.get('/', getMyBookings)
router.put('/:id/pay', payBooking)

router.get('/tutor/:tutor_id', async (req, res) => {
  try {
    const data = await BookingService.getBookingsForTutor(req.params.tutor_id)
    res.status(200).json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router

