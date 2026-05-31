import express from "express";
import lessonSessionController from "../controllers/lessonSession.controller.js";

// Sửa dòng này theo tên middleware auth thật trong project của bạn
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/test/ping", (req, res) => {
  res.json({
    message: "lesson session route is working"
  });
});

router.get(
  "/:id/meeting",
  authMiddleware,
  lessonSessionController.getMeeting
);

router.post(
  "/:id/attendance/join",
  authMiddleware,
  lessonSessionController.join
);

router.post(
  "/:id/attendance/leave",
  authMiddleware,
  lessonSessionController.leave
);

router.post(
  "/:id/tutor-confirm",
  authMiddleware,
  lessonSessionController.tutorConfirm
);

router.post(
  "/:id/learner-confirm",
  authMiddleware,
  lessonSessionController.learnerConfirm
);


export default router;