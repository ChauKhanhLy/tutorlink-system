import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Wallet = sequelize.define('Wallet', {
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
    balance: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
        allowNull: false
    },
    frozen_balance: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
        allowNull: false
    },
    total_deposited: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
        allowNull: false
    },
    total_spent: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
        allowNull: false
    },
    last_deposit_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    settlement_cycle_start: {
        type: DataTypes.DATE,
        allowNull: true
    },
    settlement_cycle_end: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'wallets',
    timestamps: true,
    underscored: true
});

export default Wallet;
