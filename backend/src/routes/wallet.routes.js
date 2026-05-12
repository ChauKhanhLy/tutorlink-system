import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import {
    getWallet,
    depositFunds,
    getTransactions,
    getSettlements,
    processSettlements,
    getWalletStats,
    confirmQRPayment
} from '../controllers/wallet.controller.js';

const router = express.Router();

// Xác nhận thanh toán QR code (Public route)
router.post('/confirm-qr-payment', confirmQRPayment);

// Áp dụng auth middleware cho các routes còn lại
router.use(authMiddleware);

// Lấy thông tin wallet
router.get('/', getWallet);

// Nạp tiền vào wallet
router.post('/deposit', depositFunds);

// Lấy lịch sử giao dịch
router.get('/transactions', getTransactions);

// Lấy settlements hàng tuần
router.get('/settlements', getSettlements);

// Lấy thống kê wallet
router.get('/stats', getWalletStats);

// Admin: Xử lý settlements hàng tuần
router.post('/process-settlements', processSettlements);



// VNPay return cho wallet deposit
router.get('/deposit/return', (req, res) => {
    try {
        const vnp_Params = req.query;
        const responseCode = vnp_Params['vnp_ResponseCode'];
        const orderId = vnp_Params['vnp_TxnRef'];
        
        if (responseCode === '00') {
            // Parse order ID để lấy user_id và amount
            const [prefix, timestamp, userId] = orderId.split('_');
            const amount = parseInt(vnp_Params['vnp_Amount']) / 100;
            
            // Nạp tiền vào wallet
            const WalletService = require('../services/wallet.service.js');
            WalletService.depositToWallet(userId, amount, `Nạp tiền qua VNPay - ${orderId}`);
            
            res.send("<h1>Nạp tiền thành công! Bạn có thể quay lại ứng dụng.</h1>");
        } else {
            res.send("<h1>Nạp tiền thất bại hoặc đã bị hủy.</h1>");
        }
    } catch (error) {
        res.status(500).send("Lỗi xử lý kết quả thanh toán");
    }
});

export default router;
