import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Booking = sequelize.define('Booking', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    datetime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'done', 'cancelled'),
        defaultValue: 'pending'
    },
    fee: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },
    tutor_id: {type: DataTypes.UUID, allowNull: false},
    learner_id: {type: DataTypes.UUID, allowNull: false},
    subject_id: {type: DataTypes.UUID, allowNull: false},
    type: {
        type: DataTypes.ENUM('trial', 'regular'),
        defaultValue: 'regular'
    }

}, {
    tableName: 'bookings',
    freezeTableName: true,
    timestamps: false
});

export default Booking;