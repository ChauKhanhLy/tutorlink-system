import multer from 'multer'
import path from 'path'

// cấu hình nơi lưu + tên file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, Date.now() + ext)
  }
})

// lọc file (chỉ cho ảnh)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Chỉ upload ảnh thôi'), false)
  }
}

export const upload = multer({ 
  storage,
  fileFilter
})