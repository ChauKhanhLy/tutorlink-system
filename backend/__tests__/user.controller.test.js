import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const userService = {
  updateProfile: jest.fn(),
  becomeTutor: jest.fn(),
  updateAvatar: jest.fn(),
}

const userDAL = {
  findById: jest.fn(),
}

jest.unstable_mockModule('../src/services/user.service.js', () => userService)
jest.unstable_mockModule('../src/dal/user.dal.js', () => userDAL)

const userController = await import('../src/controllers/user.controller.js')

const createResponse = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  }
  res.status.mockReturnValue(res)
  return res
}

describe('user controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getUserById', () => {
    it('returns user data without password when user is found', async () => {
      const req = { params: { id: '1' } }
      const res = createResponse()
      userDAL.findById.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed-password',
      })

      await userController.getUserById(req, res)

      expect(userDAL.findById).toHaveBeenCalledWith('1')
      expect(res.json).toHaveBeenCalledWith({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      })
    })

    it('returns 404 when user is not found', async () => {
      const req = { params: { id: '99' } }
      const res = createResponse()
      userDAL.findById.mockResolvedValue(null)

      await userController.getUserById(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' })
    })
  })

  describe('updateProfileInfo', () => {
    it('updates profile and returns the updated user', async () => {
      const req = {
        user: { id: 1 },
        body: { name: 'New Name', phone: '123456', location: 'HN', bio: 'Hello' },
      }
      const res = createResponse()
      const updatedUser = { id: 1, name: 'New Name', phone: '123456' }
      userService.updateProfile.mockResolvedValue(updatedUser)

      await userController.updateProfileInfo(req, res)

      expect(userService.updateProfile).toHaveBeenCalledWith(1, req.body)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Cập nhật hồ sơ thành công',
        user: updatedUser,
      })
    })

    it('returns 400 when update fails', async () => {
      const req = { user: { id: 1 }, body: {} }
      const res = createResponse()
      userService.updateProfile.mockRejectedValue(new Error('Update failed'))

      await userController.updateProfileInfo(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ message: 'Update failed' })
    })
  })

  describe('updateLearningInfo', () => {
    it('updates learning info and returns the updated user', async () => {
      const req = {
        user: { id: 1 },
        body: { current_level: 'N3', school: 'UET' },
      }
      const res = createResponse()
      const updatedUser = { id: 1, current_level: 'N3', school: 'UET' }
      userService.updateProfile.mockResolvedValue(updatedUser)

      await userController.updateLearningInfo(req, res)

      expect(userService.updateProfile).toHaveBeenCalledWith(1, req.body)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Cập nhật thông tin học tập thành công',
        user: updatedUser,
      })
    })
  })

  describe('becomeTutor', () => {
    it('registers user as a tutor and returns result', async () => {
      const req = { user: { id: 1 }, body: { bio: 'Math tutor' } }
      const res = createResponse()
      const result = { success: true }
      userService.becomeTutor.mockResolvedValue(result)

      await userController.becomeTutor(req, res)

      expect(userService.becomeTutor).toHaveBeenCalledWith(1, req.body)
      expect(res.json).toHaveBeenCalledWith(result)
    })
  })

  describe('updateAvatar', () => {
    it('updates avatar and returns standard user without password', async () => {
      const req = {
        user: { id: 1 },
        file: { filename: 'avatar.jpg' },
      }
      const res = createResponse()
      const updatedUser = {
        id: 1,
        name: 'User',
        avatar: '/uploads/avatar.jpg',
        password: 'pwd',
      }
      userService.updateAvatar.mockResolvedValue(updatedUser)

      await userController.updateAvatar(req, res)

      expect(userService.updateAvatar).toHaveBeenCalledWith(1, '/uploads/avatar.jpg')
      expect(res.json).toHaveBeenCalledWith({
        message: 'Update avatar success',
        user: { id: 1, name: 'User', avatar: '/uploads/avatar.jpg' },
      })
    })

    it('returns 400 when no file is uploaded', async () => {
      const req = { user: { id: 1 } }
      const res = createResponse()

      await userController.updateAvatar(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ message: 'Không có file upload' })
    })

    it('returns 404 if user is not found in database', async () => {
      const req = {
        user: { id: 1 },
        file: { filename: 'avatar.jpg' },
      }
      const res = createResponse()
      userService.updateAvatar.mockResolvedValue(null)

      await userController.updateAvatar(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' })
    })
  })
})
