import express from 'express';
import authMiddleware, {
  authorize
} from '../middlewares/auth.middleware.js';

import * as complaintController from '../controllers/complaint.controller.js';

const router = express.Router();

// Người dùng
router.post(
  '/',
  authMiddleware,
  complaintController.createComplaint
);

router.get(
  '/my',
  authMiddleware,
  complaintController.getMyComplaints
);

// Admin + Support Staff
router.get(
  '/admin/all',
  authMiddleware,
  authorize(
    'admin',
    'support_staff'
  ),
  complaintController.adminGetAllComplaints
);

router.put(
  '/admin/:id',
  authMiddleware,
  authorize(
    'admin',
    'support_staff'
  ),
  complaintController.adminUpdateComplaint
);

export default router;