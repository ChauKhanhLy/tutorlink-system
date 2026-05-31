import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'tutor', 'learner'),
        defaultValue: 'learner'
    },
    avatar: {
        type: DataTypes.STRING
    },
    phone: {
        type: DataTypes.STRING
    },
    verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    otp_code: {
        type: DataTypes.STRING
    },
    otp_expires: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true
});

export default User;
