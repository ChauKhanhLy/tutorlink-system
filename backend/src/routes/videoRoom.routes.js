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
