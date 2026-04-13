import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TutorProfile = sequelize.define('TutorProfile', {
    user_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        field: 'user_id'
        //allowNull: false
    },
    rating_avg: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
        field: 'rating_avg'
    }
}, {
    tableName: 'tutor_profiles',
    timestamps: false,
    underscored: true
});

export default TutorProfile;