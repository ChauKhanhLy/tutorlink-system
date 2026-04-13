import Payment from "../models/payment.model.js";
import Booking from "../models/booking.model.js";
import sequelize from "../config/database.js";

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