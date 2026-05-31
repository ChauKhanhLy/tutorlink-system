import { v4 as uuidv4 } from 'uuid';
import VideoRoom from '../models/videoRoom.model.js';
import db from '../config/db.js';
import lessonSessionService from '../services/lessonSession.service.js';

const ensureRecordingColumns = async () => {
  await db.query(`
    ALTER TABLE video_sessions
    ADD COLUMN IF NOT EXISTS record_url TEXT
  `);

  await db.query(`
    ALTER TABLE video_sessions
    ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 0
  `);
};

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

export const getVideoRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const videoRoom = await VideoRoom.findByPk(id);

    if (!videoRoom) {
      return res.status(404).json({
        error: 'Không tìm thấy video room',
      });
    }

    res.status(200).json(videoRoom);
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

    // Ghi log rời lớp nếu có lesson_session_id
    if (status === 'ended') {
        try {
            const selectRes = await db.query('SELECT lesson_session_id FROM video_sessions WHERE id = $1', [id]);
            const lessonSessionId = selectRes.rows[0]?.lesson_session_id;
            if (lessonSessionId && req.user?.id) {
                await lessonSessionService.leaveLessonSession(lessonSessionId, req.user.id);
                console.log(`User ${req.user.id} logged leave for session ${lessonSessionId}`);
            }
        } catch (err) {
            console.error('Error logging leave on ended:', err);
        }
    }

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

    // Bỏ qua kiểm tra trạng thái và thời gian để test


    // Bỏ qua kiểm tra thời gian để test


    if (videoRoom.status === 'scheduled') {
      videoRoom.status = 'ongoing';
      await videoRoom.save();
    }

    // Ghi log vào lớp nếu có lesson_session_id
    try {
        const selectRes = await db.query('SELECT lesson_session_id FROM video_sessions WHERE id = $1', [id]);
        const lessonSessionId = selectRes.rows[0]?.lesson_session_id;
        if (lessonSessionId && req.user?.id) {
            await lessonSessionService.joinLessonSession(lessonSessionId, req.user.id);
            console.log(`User ${req.user.id} logged join for session ${lessonSessionId}`);
        }
    } catch (err) {
        console.error('Error logging join:', err);
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

export const uploadRecording = async (req, res) => {
  try {
    const { id } = req.params;
    const durationMinutes = req.body.duration_minutes ? parseInt(req.body.duration_minutes) : 0;
    await ensureRecordingColumns();

    if (!req.file) {
      return res.status(400).json({ error: 'Không tìm thấy file video upload' });
    }

    const videoRoom = await VideoRoom.findByPk(id);

    if (!videoRoom) {
      return res.status(404).json({ error: 'Không tìm thấy video room' });
    }

    // Đường dẫn tương đối tĩnh để client truy cập qua static middleware
    const recordUrl = `/uploads/recordings/${req.file.filename}`;

    const updateRes = await db.query(
      `
      UPDATE video_sessions
      SET record_url = $1,
          duration_minutes = $2
      WHERE id = $3
      RETURNING *
      `,
      [recordUrl, durationMinutes, id]
    );

    const updatedVideoRoom = updateRes.rows[0];

    console.log(`[uploadRecording] Đã lưu bản ghi cho video room ${id}: ${recordUrl}`);

    res.status(200).json({
      message: 'Tải lên bản ghi thành công',
      record_url: recordUrl,
      videoRoom: updatedVideoRoom
    });
  } catch (error) {
    console.error('uploadRecording error:', error);
    res.status(500).json({ error: error.message });
  }
};
