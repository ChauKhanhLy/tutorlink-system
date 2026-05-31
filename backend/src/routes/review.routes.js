import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { getReviewsByTutor, getReviewsByBooking, postReview } from '../controllers/review.controller.js';

const router = express.Router();
router.get('/', getReviewsByTutor);
router.get('/booking', getReviewsByBooking);
router.post('/', authMiddleware, postReview);
export default router;