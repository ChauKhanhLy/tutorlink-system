import Payment from "../models/payment.model.js";
import Booking from "../models/booking.model.js";
import sequelize from "../config/database.js";
import { VNPay } from 'vnpay';
import dotenv from 'dotenv';
import { dateFormat } from "vnpay";
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
    vnpayHost: 'https://sandbox.vnpayment.vn',
});

export const createVNPayUrl = async (booking, ipAddr) => {
    const amount = Math.floor(Number(booking.fee));

    const paymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: amount, 
        vnp_IpAddr: '127.0.0.1',
        vnp_TxnRef: booking.id,
        vnp_OrderInfo: 'Thanh toan lich hoc TutorLink',
        vnp_OrderType: 'billpayment',
        vnp_ReturnUrl: process.env.VNP_RETURNURL,
        vnp_Locale: 'vn',
        vnp_CreateDate: dateFormat(new Date()),
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_CurrCode: 'VND',
    });

    return paymentUrl;
};