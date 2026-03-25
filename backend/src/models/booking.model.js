import { DataTypes } from 'sequelize';
import sequelize from '..config.database.js';

const Booking = sequelize.define('Booking', {
    datetime: {
        type: DataTypes.DATE,
        allowNull: false;
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'done', 'cancel'),
        defaultValue: 'pending'
    },
    fee: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },
    tutor_id: {type: DataTypes.INTEGER, allowNull: false},
    learner_id: {type: DataTypes.INTEGER, allowNull: false},
    subject_id: {type: DataTypes.INTEGER, allowNull: false}
});

export default Booking;