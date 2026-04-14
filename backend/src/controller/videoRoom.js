/*
import {
  createVideoRoomModel,
  getVideoRoomByBookingIdModel,
  getVideoRoomByIdModel,
  updateVideoRoomStatusModel,
} from '../models/videoRoom.model.js';

export const createVideoRoom = async (req, res) => {
  try {
    const {
      booking_id,
      room_id,
      provider,
      start_time,
      end_time,
      status = 'scheduled',
    } = req.body;

    if (!booking_id || !room_id || !provider || !start_time || !end_time) {
      return res.status(400).json({
        message: 'Thiếu dữ liệu bắt buộc',
      });
    }

    const room = await createVideoRoomModel({
      booking_id,
      room_id,
      provider,
      start_time,
      end_time,
      status,
    });

    return res.status(201).json({
      message: 'Tạo video room thành công',
      data: room,
    });
  } catch (error) {
    console.error('createVideoRoom error:', error);
    return res.status(500).json({
      message: 'Lỗi server',
    });
  }
};

export const getVideoRoomByBookingId = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const room = await getVideoRoomByBookingIdModel(booking_id);

    if (!room) {
      return res.status(404).json({
        message: 'Không tìm thấy video room',
      });
    }

    return res.status(200).json(room);
  } catch (error) {
    console.error('getVideoRoomByBookingId error:', error);
    return res.status(500).json({
      message: 'Lỗi server',
    });
  }
};

export const joinVideoRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await getVideoRoomByIdModel(id);

    if (!room) {
      return res.status(404).json({
        message: 'Không tìm thấy video room',
      });
    }

    const now = new Date();
    const start = new Date(room.start_time);
    const end = new Date(room.end_time);

    if (room.status === 'cancelled') {
      return res.status(400).json({
        message: 'Buổi học đã bị hủy',
      });
    }

    if (room.status === 'ended' || now > end) {
      return res.status(400).json({
        message: 'Buổi học đã kết thúc',
      });
    }

    if (now < start) {
      return res.status(400).json({
        message: 'Chưa đến giờ học',
      });
    }

    if (room.status === 'scheduled') {
      await updateVideoRoomStatusModel(id, 'ongoing');
    }

    return res.status(200).json({
      message: 'Join room thành công',
      data: {
        room_url: room.room_id,
        provider: room.provider,
      },
    });
  } catch (error) {
    console.error('joinVideoRoom error:', error);
    return res.status(500).json({
      message: 'Lỗi server',
    });
  }
};

export const updateVideoRoomStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatus = ['scheduled', 'ongoing', 'ended', 'cancelled'];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: 'Status không hợp lệ',
      });
    }

    const updatedRoom = await updateVideoRoomStatusModel(id, status);

    if (!updatedRoom) {
      return res.status(404).json({
        message: 'Không tìm thấy video room',
      });
    }

    return res.status(200).json({
      message: 'Cập nhật status thành công',
      data: updatedRoom,
    });
  } catch (error) {
    console.error('updateVideoRoomStatus error:', error);
    return res.status(500).json({
      message: 'Lỗi server',
    });
  }
};
*/

import { v4 as uuidv4 } from 'uuid';
import VideoRoom from '../models/videoRoom.model.js';

export const getAllVideoRooms = async (req, res) => {
  try {
    const videoRooms = await VideoRoom.findAll({
      order: [['start_time', 'ASC']],
    });

    res.status(200).json(videoRooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getVideoRoomByBookingId = async (req, res) => {
  try {
    const { booking_id } = req.params;

    const videoRoom = await VideoRoom.findOne({
      where: { booking_id },
    });

    if (!videoRoom) {
      return res.status(404).json({
        error: 'Không tìm thấy video room cho booking này',
      });
    }

    res.status(200).json(videoRoom);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createVideoRoom = async (req, res) => {
  try {
    const {
      booking_id,
      room_id,
      provider,
      start_time,
      end_time,
      status,
    } = req.body;

    if (!booking_id || !room_id || !provider || !start_time || !end_time) {
      return res.status(400).json({
        error: 'Thiếu booking_id, room_id, provider, start_time hoặc end_time',
      });
    }

    const existingRoom = await VideoRoom.findOne({
      where: { booking_id },
    });

    if (existingRoom) {
      return res.status(400).json({
        error: 'Booking này đã có video room rồi',
      });
    }

    const videoRoom = await VideoRoom.create({
      id: uuidv4(),
      booking_id,
      room_id,
      provider,
      start_time,
      end_time,
      status: status || 'scheduled',
    });

    res.status(201).json(videoRoom);
  } catch (error) {
    console.error('createVideoRoom error:', error);

    if (error.errors) {
      return res.status(500).json({
        error: error.message,
        details: error.errors.map((e) => ({
          message: e.message,
          path: e.path,
          value: e.value,
        })),
      });
    }

    res.status(500).json({ error: error.message });
  }
};

export const updateVideoRoomStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatus = ['scheduled', 'ongoing', 'ended', 'cancelled'];

    if (!status) {
      return res.status(400).json({
        error: 'Thiếu status',
      });
    }

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        error: 'Status không hợp lệ',
      });
    }

    const videoRoom = await VideoRoom.findByPk(id);

    if (!videoRoom) {
      return res.status(404).json({
        error: 'Không tìm thấy video room',
      });
    }

    videoRoom.status = status;
    await videoRoom.save();

    res.status(200).json(videoRoom);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const joinVideoRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const videoRoom = await VideoRoom.findByPk(id);

    if (!videoRoom) {
      return res.status(404).json({
        error: 'Không tìm thấy video room',
      });
    }

    const now = new Date();
    const startTime = new Date(videoRoom.start_time);
    const endTime = new Date(videoRoom.end_time);

    if (videoRoom.status === 'cancelled') {
      return res.status(400).json({
        error: 'Buổi học đã bị hủy',
      });
    }

    if (videoRoom.status === 'ended' || now > endTime) {
      return res.status(400).json({
        error: 'Buổi học đã kết thúc',
      });
    }

    if (now < startTime) {
      return res.status(400).json({
        error: 'Chưa đến giờ học',
      });
    }

    if (videoRoom.status === 'scheduled') {
      videoRoom.status = 'ongoing';
      await videoRoom.save();
    }

    res.status(200).json({
      message: 'Join room thành công',
      room_url: videoRoom.room_id,
      provider: videoRoom.provider,
      start_time: videoRoom.start_time,
      end_time: videoRoom.end_time,
      status: videoRoom.status,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};