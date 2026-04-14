import express from 'express';
import { postPayment } from '../controllers/payment.controller.js';
import { createPaymentUrl, vnpayReturn } from '../controllers/payment.controller.js';

const router = express.Router();

router.post('/', postPayment); 
router.post('/create_url', createPaymentUrl);
router.get('/vnpay_return', vnpayReturn);

export default router;