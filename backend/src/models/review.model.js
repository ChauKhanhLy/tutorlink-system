import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Review = sequelize.define('Review', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    booking_id: { type: DataTypes.UUID, allowNull: false},
    reviewer_id: { type: DataTypes.UUID, allowNull: false},
    rating: { type: DataTypes.INTEGER, validate: { min: 1, max: 5}},
    comment: {type: DataTypes.TEXT}
}, { 
    tableName: 'reviews',
    timestamps: true,
    underscored: true,
    updatedAt: false
});

export default Review;