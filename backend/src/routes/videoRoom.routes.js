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

/*import express from 'express';
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

module.exports = router
//export default router;*/
import express from 'express'
import * as videoRoomController from '../controllers/videoRoom.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'
import { uploadRecordingMiddleware } from '../middlewares/uploadRecord.middleware.js'

const router = express.Router()

router.get('/', videoRoomController.getAllVideoRooms)
router.get('/:id', videoRoomController.getVideoRoomById) // Added this
router.get('/booking/:booking_id', videoRoomController.getVideoRoomByBookingId)
router.post('/', videoRoomController.createVideoRoom)
router.patch('/:id/status', authMiddleware, videoRoomController.updateVideoRoomStatus)
router.get('/:id/join', authMiddleware, videoRoomController.joinVideoRoom)
router.post('/:id/record', authMiddleware, uploadRecordingMiddleware, videoRoomController.uploadRecording)

export default router
