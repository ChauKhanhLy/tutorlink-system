import * as WalletService from '../services/wallet.service.js';
import sequelize from '../config/database.js';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { getOnlineUserSocket } from '../socket/chat.socket.js';

// Lưu trữ các giao dịch QR đang chờ thanh toán trong bộ nhớ (Dùng cho demo)
const pendingQRPayments = new Map();

// Helper: Định dạng thời gian YYYYMMDDHHMMSS chuẩn múi giờ Việt Nam (GMT+7)
const formatVNDate = (date) => {
    const d = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
    const pad = (n) => n.toString().padStart(2, '0');
    return d.getFullYear() +
        pad(d.getMonth() + 1) +
        pad(d.getDate()) +
        pad(d.getHours()) +
        pad(d.getMinutes()) +
        pad(d.getSeconds());
};

// Hàm tạo URL thanh toán VNPay
const createVNPayUrl = async (userId, amount, req) => {
    const vnp_TmnCode = process.env.VNP_TMNCODE || 'VNPAYMIRROR';
    const vnp_HashSecret = process.env.VNP_HASHSECRET || 'KJHGKJHGFHJKHFGHJKHFGHJKHFGHJKHFGHJK';
    const vnp_Url = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    const vnp_ReturnUrl = process.env.VNP_RETURNURL || 'http://localhost:5173/wallet/deposit/return';

    const date = new Date();
    const createDate = formatVNDate(date);
    
    // Thời gian hết hạn: 15 phút sau
    const expireDateRaw = new Date(date.getTime() + 15 * 60 * 1000);
    const expireDate = formatVNDate(expireDateRaw);

    const orderId = `WALLET_${Date.now()}_${userId}`;
    const orderInfo = `Nap tien vi TutorLink - User ${userId}`;

    let vnp_Params = {
        'vnp_Version': '2.1.0',
        'vnp_Command': 'pay',
        'vnp_TmnCode': vnp_TmnCode,
        'vnp_Locale': 'vn',
        'vnp_CurrCode': 'VND',
        'vnp_TxnRef': orderId,
        'vnp_OrderInfo': orderInfo,
        'vnp_OrderType': 'other', // Nạp tiền thường dùng 'other'
        'vnp_Amount': amount * 100, // VNPay đơn vị là đồng * 100
        'vnp_ReturnUrl': vnp_ReturnUrl,
        'vnp_IpAddr': '127.0.0.1',
        'vnp_CreateDate': createDate,
        'vnp_ExpireDate': expireDate
    };

    // Sắp xếp các tham số theo alphabet (Bắt buộc)
    vnp_Params = Object.keys(vnp_Params)
        .sort()
        .reduce((res, key) => {
            res[key] = vnp_Params[key];
            return res;
        }, {});

    // Tạo chuỗi query string
    const signData = new URLSearchParams(vnp_Params).toString();
    
    // Tạo mã băm SecureHash
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    
    vnp_Params['vnp_SecureHash'] = signed;

    // Trả về URL cuối cùng
    return vnp_Url + '?' + new URLSearchParams(vnp_Params).toString();
};

export const getWallet = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const wallet = await WalletService.getOrCreateWallet(userId);
        res.json({ success: true, data: wallet });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const depositFunds = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { amount, payment_method } = req.body;

        // Kiểm tra số tiền tối thiểu (VNPay thường yêu cầu ít nhất 10.000đ)
        if (!amount || amount < 10000) {
            return res.status(400).json({ success: false, message: "Số tiền tối thiểu là 10,000 VND" });
        }

        if (payment_method === 'VNPay') {
            console.log("Creating QR code payment...");
            
            // Tạo mã giao dịch QR có chứa số tiền
            const dataStr = `${amount}_${Date.now()}_${userId}`;
            const signature = crypto.createHmac('sha256', process.env.JWT_SECRET || 'secret').update(dataStr).digest('hex').substring(0, 8);
            const transactionId = `QR_${dataStr}_${signature}`;
            
            // Lưu vào bộ nhớ để chống thanh toán trùng lặp (hết hạn sau 5 phút)
            pendingQRPayments.set(transactionId, { 
                amount, 
                userId, 
                expiresAt: Date.now() + 5 * 60 * 1000 
            });
            
            // Dọn dẹp các giao dịch hết hạn trong Map
            for (const [key, value] of pendingQRPayments.entries()) {
                if (Date.now() > value.expiresAt) {
                    pendingQRPayments.delete(key);
                }
            }

            // Tạo QR code chứa URL tới trang xác nhận
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const qrUrl = `${frontendUrl}/qr-pay/${transactionId}`;
            
            const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
                width: 256,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            
            res.json({ 
                success: true, 
                message: "Tạo mã QR thanh toán thành công", 
                data: { 
                    qr_payment: true,
                    payment_method: 'QR_CODE',
                    transaction_id: transactionId,
                    amount: amount,
                    qr_code: qrCodeDataUrl,
                    status: 'pending',
                    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 phút hết hạn
                }
            });
        } else {
            // Các phương thức khác có thể xử lý tại đây hoặc báo lỗi
            return res.status(400).json({ success: false, message: "Phương thức thanh toán chưa được hỗ trợ" });
        }
    } catch (error) {
        console.error("Deposit error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getTransactions = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const transactions = await WalletService.getWalletTransactions(userId, parseInt(limit), parseInt(offset));
        
        res.json({ 
            success: true, 
            data: transactions.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: transactions.count,
                totalPages: Math.ceil(transactions.count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getSettlements = async (req, res) => {
    try {
        const userId = req.user?.id;
        const settlements = await WalletService.getWeeklySettlements(userId);
        res.json({ success: true, data: settlements });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const processSettlements = async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Chỉ admin được phép thực hiện" });
        }
        const result = await WalletService.processWeeklySettlements();
        res.json({ 
            success: true, 
            message: `Đã xử lý ${result.processed} settlement thành công`,
            data: result 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getWalletStats = async (req, res) => {
    try {
        const userId = req.user?.id;
        const wallet = await WalletService.getOrCreateWallet(userId);
        const settlements = await WalletService.getWeeklySettlements(userId);
        
        const totalSettled = settlements.reduce((sum, s) => sum + parseFloat(s.settled_amount || 0), 0);
        const pendingAmount = settlements
            .filter(s => s.status === 'pending')
            .reduce((sum, s) => sum + parseFloat(s.pending_amount || 0), 0);
        
        res.json({
            success: true,
            data: {
                balance: parseFloat(wallet.balance),
                frozen_balance: parseFloat(wallet.frozen_balance),
                total_deposited: parseFloat(wallet.total_deposited),
                total_spent: parseFloat(wallet.total_spent),
                total_settled: totalSettled,
                pending_settlements: pendingAmount,
                last_deposit: wallet.last_deposit_date
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Xác nhận thanh toán QR Code
export const confirmQRPayment = async (req, res) => {
    try {
        const { transactionId } = req.body;
        
        if (!transactionId) {
            return res.status(400).json({ success: false, message: "Thiếu mã giao dịch" });
        }
        
        // Kiểm tra xem giao dịch này đã được thanh toán chưa
        if (!pendingQRPayments.has(transactionId)) {
            return res.status(400).json({ success: false, message: "Mã giao dịch không tồn tại, đã hết hạn hoặc đã được thanh toán" });
        }

        const parts = transactionId.split('_');
        if (parts.length < 5 || parts[0] !== 'QR') {
            return res.status(400).json({ success: false, message: "Mã giao dịch không hợp lệ" });
        }
        
        const [prefix, amountStr, timestamp, userId, signature] = parts;
        
        // Xác minh tính toàn vẹn của mã giao dịch
        const expectedSignature = crypto.createHmac('sha256', process.env.JWT_SECRET || 'secret')
            .update(`${amountStr}_${timestamp}_${userId}`)
            .digest('hex').substring(0, 8);
            
        if (signature !== expectedSignature) {
            return res.status(400).json({ success: false, message: "Mã giao dịch đã bị chỉnh sửa hoặc không hợp lệ" });
        }
        
        const amount = parseInt(amountStr, 10);
        
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        
        // Xóa khỏi danh sách chờ để ngăn chặn thanh toán lại
        pendingQRPayments.delete(transactionId);
        
        // Nạp tiền vào ví
        const result = await WalletService.depositToWallet(userId, amount, `Thanh toán QR Code - ${transactionId}`);
        
        // Phát sự kiện realtime cho tất cả các tab của user (Room: userId)
        const io = req.app.get('io');
        console.log(`[QR Payment] Emitting payment_success to room: ${userId}`);
        if (io) {
            io.to(userId.toString()).emit('payment_success', { 
                transactionId, 
                amount, 
                newBalance: result.wallet.balance 
            });
        }
        
        res.json({ 
            success: true, 
            message: "Xác nhận thanh toán QR thành công", 
            data: { 
                transaction_id: transactionId,
                status: 'completed',
                wallet: result.wallet,
                transaction: result.transaction
            }
        });
        
    } catch (error) {
        console.error("QR Payment confirmation error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};