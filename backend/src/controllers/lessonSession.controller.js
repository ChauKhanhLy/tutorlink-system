import lessonSessionService from "../services/lessonSession.service.js";

async function getMeeting(req, res) {
  try {
    const lessonSessionId = req.params.id;
    const userId = req.user.id;

    const meeting = await lessonSessionService.getOrCreateMeeting(
      lessonSessionId,
      userId
    );

    return res.json(meeting);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Không lấy được phòng học"
    });
  }
}

async function join(req, res) {
  try {
    const lessonSessionId = req.params.id;
    const userId = req.user.id;

    const log = await lessonSessionService.joinLessonSession(
      lessonSessionId,
      userId
    );

    return res.json(log);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Không ghi được log vào lớp"
    });
  }
}

async function leave(req, res) {
  try {
    const lessonSessionId = req.params.id;
    const userId = req.user.id;

    const log = await lessonSessionService.leaveLessonSession(
      lessonSessionId,
      userId
    );

    return res.json(log);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Không ghi được log rời lớp"
    });
  }
}

async function tutorConfirm(req, res) {
  try {
    const lessonSessionId = req.params.id;
    const tutorId = req.user.id;

    const updatedSession = await lessonSessionService.confirmTutorTaught(
      lessonSessionId,
      tutorId
    );

    return res.json(updatedSession);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Tutor xác nhận thất bại"
    });
  }
}

async function learnerConfirm(req, res) {
  try {
    const lessonSessionId = req.params.id;
    const learnerId = req.user.id;

    const updatedSession = await lessonSessionService.confirmLearnerStudied(
      lessonSessionId,
      learnerId
    );

    return res.json(updatedSession);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Learner xác nhận thất bại"
    });
  }
}

export default {
  getMeeting,
  join,
  leave,
  tutorConfirm,
  learnerConfirm
};