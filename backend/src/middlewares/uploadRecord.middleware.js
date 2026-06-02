import multer from 'multer';
import path from 'path';
import fs from 'fs';
// Đảm bảo thư mục lưu trữ video tồn tại
const recordingDir = 'uploads/recordings';
if (!fs.existsSync(recordingDir)) {
  fs.mkdirSync(recordingDir, { recursive: true });
}
// Cấu hình lưu trữ cho recordings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, recordingDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm';
    // Đặt tên theo room id và timestamp để tránh trùng lặp
    const roomId = req.params.id || 'unknown';
    cb(null, `recording-${roomId}-${Date.now()}${ext}`);
  }
});
// Chỉ cho phép upload video .webm hoặc .mp4
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['video/webm', 'video/mp4', 'video/x-matroska', 'application/octet-stream'];
  if (allowedMimeTypes.includes(file.mimetype) || file.originalname.endsWith('.webm') || file.originalname.endsWith('.mp4')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận upload file video (.webm, .mp4)'), false);
  }
};
export const uploadRecordingMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // Giới hạn 100MB cho bản ghi
  }
}).single('video');
