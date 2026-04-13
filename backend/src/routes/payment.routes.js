import express from 'express';
import { postPayment } from '../controllers/payment.controller.js';

const router = express.Router();

router.post('/', postPayment); 

export default router;