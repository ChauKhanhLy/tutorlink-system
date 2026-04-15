import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Payment = sequelize.define('Payment', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true},
    booking_id: { type: DataTypes.UUID, allowNull: false},
    payer_id: {type: DataTypes.UUID, allowNull: false},
    receiver_id: { type: DataTypes.UUID, allowNull: false},
    amount: {type: DataTypes.DECIMAL(12,2), allowNull: false},
    type: { type: DataTypes.STRING(20), defaultValue: 'lesson'},
    status: { type: DataTypes.STRING(20), defaultValue: 'pending'},
    provider: { type: DataTypes.STRING(50), defaultValue: 'vnpay'}
}, {
    tableName: 'payments',
    timestamps: true,
    underscored: true,
    updatedAt: false
});

export default Payment;