import * as PaymentService from '../services/payment.service.js';
import Booking from '../models/booking.model.js';

export const postPayment = async (req, res) => {
    try{
        const { booking_id, amount, provider} = req.body;

        const booking = await Booking.findByPk(booking_id);
        if(!booking) return res.status(404).json({ message: "Lịch học không tồn tại"});

        const result = await PaymentService.processPaymentLogic({
            booking_id,
            payer_id: booking.learner_id,
            receiver_id: booking.tutor_id,
            amount,
            provider,
            type: 'lesson'
        });

        res.status(201).json({success: true, message: "Thanh toán thành công!", data: result});
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });

    }
};

export const createPaymentUrl = async (req,res) => {
    try{
        const { booking_id } = req.body;
        const booking = await Booking.findByPk(booking_id);

        if(!booking) return res.status(404).json({message: "Khong thay lich hoc"});
        
        const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "127.0.0.1";
        const url = await PaymentService.createVNPayUrl(booking, ipAddr);
        res.status(200).json({success: true, url});
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
};

export const vnpayReturn = async (req, res) => {
    try {
        const vnp_Params = req.query;
        const responseCode = vnp_Params['vnp_ResponseCode'];
        const booking_id = vnp_Params['vnp_TxnRef'];

        if (responseCode === '00') {
            await Booking.update({ status: 'confirmed' }, { where: { id: booking_id } });
            
            res.send("<h1>Thanh toán thành công! Bạn có thể quay lại ứng dụng.</h1>");
        } else {
            res.send("<h1>Thanh toán thất bại hoặc đã bị hủy.</h1>");
        }
    } catch (error) {
        res.status(500).send("Lỗi xử lý kết quả thanh toán");
    }
};