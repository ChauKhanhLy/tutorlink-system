import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import * as complaintController from '../controllers/complaint.controller.js';

const router = express.Router();

// Người dùng thường
router.post('/', authMiddleware, complaintController.createComplaint);
router.get('/my', authMiddleware, complaintController.getMyComplaints);

// Admin
router.get('/admin/all', authMiddleware, roleMiddleware('admin'), complaintController.adminGetAllComplaints);
router.put('/admin/:id', authMiddleware, roleMiddleware('admin'), complaintController.adminUpdateComplaint);

export default router;