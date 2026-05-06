import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    wallet_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'wallets',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('deposit', 'spend', 'refund', 'settlement'),
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    reference_id: {
        type: DataTypes.UUID,
        allowNull: true // booking_id, refund_id, settlement_id
    },
    reference_type: {
        type: DataTypes.ENUM('booking', 'refund', 'settlement'),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
        defaultValue: 'pending',
        allowNull: false
    },
    settlement_week: {
        type: DataTypes.STRING(7), // Format: 2026-W18
        allowNull: true
    },
    settlement_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    processed_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'transactions',
    timestamps: true,
    underscored: true
});

export default Transaction;
