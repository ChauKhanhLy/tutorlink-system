import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';


const VideoRoom = sequelize.define(
  'VideoRoom',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    booking_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    room_id: {
      type: DataTypes.STRING(255), // lưu URL
      allowNull: false,
    },
    provider: {
      type: DataTypes.STRING(50), // google_meet, zoom...
      allowNull: false,
    },
    start_time: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    end_time: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'scheduled',
    },
    lesson_session_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    record_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    tableName: 'video_sessions',
    timestamps: false,
  }
);

export default VideoRoom;