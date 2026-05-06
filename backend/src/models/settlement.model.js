import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Settlement = sequelize.define('Settlement', {
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
    week_start: {
        type: DataTypes.DATE,
        allowNull: false
    },
    week_end: {
        type: DataTypes.DATE,
        allowNull: false
    },
    total_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    settled_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    pending_amount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
        defaultValue: 'pending',
        allowNull: false
    },
    processed_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    admin_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'settlements',
    timestamps: true,
    underscored: true
});

export default Settlement;
