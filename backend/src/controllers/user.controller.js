import { updateProfile as updateProfileService, becomeTutor as becomeTutorService } from '../services/user.service.js'
import { findById } from '../dal/user.dal.js'
import * as userService from '../services/user.service.js'

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params
    const user = await findById(id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    // Không trả về password
    const { password, ...userWithoutPassword } = user
    res.json(userWithoutPassword)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}
export const updateProfileInfo =
  async (req, res) => {

    try {

      const userId =
        req.user.id;

      const {
        name,
        phone,
        avatar,
        location,
        bio
      } = req.body;

      const updatedUser =
        await updateProfileService(
          userId,
          {
            name,
            phone,
            avatar,
            location,
            bio
          }
        );

      res.json({
        message:
          "Cập nhật hồ sơ thành công",
        user: updatedUser
      });

    } catch (err) {

      console.error(err);

      res.status(400).json({
        message: err.message
      });

    }
};
export const updateLearningInfo =
  async (req, res) => {

    try {

      const userId =
        req.user.id;

      const {
        current_level,
        school,
        grade,
        target,
        learning_goal
      } = req.body;

      const updatedUser =
        await updateProfileService(
          userId,
          {
            current_level,
            school,
            grade,
            target,
            learning_goal
          }
        );

      res.json({
        message:
          "Cập nhật thông tin học tập thành công",
        user: updatedUser
      });

    } catch (err) {

      console.error(err);

      res.status(400).json({
        message: err.message
      });

    }
};


export const becomeTutor = async (req, res) => {
  try {
    const userId = req.user.id
    const payload = req.body || {}

    const result = await becomeTutorService(userId, payload)

    res.json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const updateAvatar = async (req, res) => {
  try {
    const userId = req.user.id

    if (!req.file) {
      return res.status(400).json({
        message: "Không có file upload"
      })
    }

    const avatarUrl = `/uploads/${req.file.filename}`
    console.log("avatarUrl:", avatarUrl)

    const updatedUser = await userService.updateAvatar(userId, avatarUrl)

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found"
      })
    }

    const { password, ...userWithoutPassword } = updatedUser

    return res.status(200).json({
      message: "Update avatar success",
      user: userWithoutPassword
    })
  } catch (err) {
    console.error("Lỗi updateAvatar:", err)

    return res.status(500).json({
      message: "Lỗi server khi upload avatar",
      error: err.message
    })
  }
}

// export const updateAvatar = async (req, res) => {
//   try {
//     console.log("API HIT")
//     const userId = req.user.id
//     console.log("userId:", userId)

//     console.log(" file:", req.file)
//     // không có file
//     if (!req.file) {
//       return res.status(400).json({ message: 'Không có file upload' })
//     }

//     // tạo đường dẫn avatar
//     const avatarUrl = `/uploads/${req.file.filename}`
//      console.log("avatarUrl:", avatarUrl)
//     // update DB
//     const updatedUser = await userService.updateAvatar(userId, avatarUrl)
//     console.log("updated user:", updatedUser)
//     // nếu không tìm thấy user
//     if (!updatedUser) {
      
//       return res.status(404).json({ message: 'User not found' })
//     }

//     // loại bỏ password
//     const { password, ...userWithoutPassword } = updatedUser

//     // trả về chuẩn
//     res.json({
//       message: "Update avatar success",
//       user: userWithoutPassword
//     })

//   } catch (err) {
//     console.error(err)
//     res.status(500).json({ message: err.message })
//   }
// }


/*const userService = require('../services/user.service')

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id   // lấy từ JWT
    const { name, phone, avatar } = req.body

    const updatedUser = await userService.updateProfile(userId, {
      name,
      phone,
      avatar
    })

    res.json({
      message: "Update profile success",
      user: updatedUser
    })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.becomeTutor = async (req, res) => {
  try {
    const userId = req.user.id

    const result = await userService.becomeTutor(userId)

    res.json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}*/