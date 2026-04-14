import Payment from "../models/payment.model.js";
import Booking from "../models/booking.model.js";
import sequelize from "../config/database.js";
import { VNPay } from 'vnpay';
import dotenv from 'dotenv';
dotenv.config();

export const processPaymentLogic = async (data) => {
    const t = await sequelize.transaction();

    try{
        const newPayment = await Payment.create({
            ...data,
            status: 'success'
        }, { transaction: t});

        const booking = await Booking.findByPk(data.booking_id);
        if(!booking) throw new Error("Không tìm thấy lịch học tương ứng");

        booking.status = 'confirmed';
        await booking.save({transaction: t});

        await t.commit();
        return newPayment;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

const vnpay = new VNPay({
    tmnCode: process.env.VNP_TMNCODE,
    secureSecret: process.env.VNP_HASHSECRET,
    vnpayHost: process.env.VNP_URL,
});

export const createCNPayUrl = async (booking, ipAddr) => {
    const paymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: Number(booking.fee),
        vnp_IpAddr: ipAddr,
        vnp_TxnRef: booking.id,
        vnp_OrderInfo: 'Thanh toan lich hoc ${booking.id}',
        vnp_ReturnUrl: process.env.VNP_RETURNURL,
    });
    return paymentUrl;
};