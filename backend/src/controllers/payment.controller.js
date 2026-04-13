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