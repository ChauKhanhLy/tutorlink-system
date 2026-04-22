
/*
import pool from '../config/db.js';

export const createVideoRoomModel = async ({
  booking_id,
  room_id,
  provider,
  start_time,
  end_time,
  status,
}) => {
  const query = `
    INSERT INTO video_rooms (booking_id, room_id, provider, start_time, end_time, status)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  const values = [booking_id, room_id, provider, start_time, end_time, status];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const getVideoRoomByBookingIdModel = async (booking_id) => {
  const query = `
    SELECT * FROM video_rooms
    WHERE booking_id = $1
    LIMIT 1;
  `;
  const result = await pool.query(query, [booking_id]);
  return result.rows[0];
};

export const getVideoRoomByIdModel = async (id) => {
  const query = `
    SELECT * FROM video_rooms
    WHERE id = $1
    LIMIT 1;
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

export const updateVideoRoomStatusModel = async (id, status) => {
  const query = `
    UPDATE video_rooms
    SET status = $1
    WHERE id = $2
    RETURNING *;
  `;
  const result = await pool.query(query, [status, id]);
  return result.rows[0];
};
*/

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
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    end_time: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'scheduled',
    },
  },
  {
    tableName: 'video_sessions',
    timestamps: false,
  }
);

export default VideoRoom;