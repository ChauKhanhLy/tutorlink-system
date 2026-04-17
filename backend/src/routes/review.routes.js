import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { getReviewsByTutor, postReview } from '../controllers/review.controller.js';

const router = express.Router();
router.get('/', getReviewsByTutor);
router.post('/', authMiddleware, postReview);
export default router;