import express from 'express';
import { postReview } from '../controllers/review.controller.js';

const router = express.Router();
router.post('/', postReview);
export default router;