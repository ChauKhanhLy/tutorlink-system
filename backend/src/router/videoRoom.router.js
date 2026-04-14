/*
import express from 'express';
import {
  createVideoRoom,
  getVideoRoomByBookingId,
  joinVideoRoom,
  updateVideoRoomStatus,
} from '../controller/videoRoom.controller.js';

const router = express.Router();

router.post('/', createVideoRoom);
router.get('/booking/:booking_id', getVideoRoomByBookingId);
router.get('/:id/join', joinVideoRoom);
router.patch('/:id/status', updateVideoRoomStatus);

export default router;
*/

import express from 'express';
import {
  getAllVideoRooms,
  getVideoRoomByBookingId,
  createVideoRoom,
  updateVideoRoomStatus,
  joinVideoRoom,
} from '../controller/videoRoom.js';

const router = express.Router();

router.get('/', getAllVideoRooms);
router.get('/booking/:booking_id', getVideoRoomByBookingId);
router.post('/', createVideoRoom);
router.patch('/:id/status', updateVideoRoomStatus);
router.get('/:id/join', joinVideoRoom);

export default router;