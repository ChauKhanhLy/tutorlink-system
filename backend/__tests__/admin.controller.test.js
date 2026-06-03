import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const userService = {
  verifyTutor: jest.fn(),
  getPendingTutors: jest.fn(),
}

const db = {
  query: jest.fn(),
}

jest.unstable_mockModule('../src/services/user.service.js', () => userService)
jest.unstable_mockModule('../src/config/db.js', () => ({ default: db }))

const adminController = await import('../src/controllers/admin.controller.js')

const createResponse = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  }
  res.status.mockReturnValue(res)
  return res
}

describe('Admin Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('verifyTutor', () => {
    it('should verify tutor successfully', async () => {
      const req = { params: { id: '1' } }
      const res = createResponse()
      const result = { success: true }

      userService.verifyTutor.mockResolvedValue(result)

      await adminController.verifyTutor(req, res)

      expect(userService.verifyTutor).toHaveBeenCalledWith('1')
      expect(res.json).toHaveBeenCalledWith(result)
    })

    it('should return 400 when service throws', async () => {
      const req = { params: { id: '1' } }
      const res = createResponse()

      userService.verifyTutor.mockRejectedValue(new Error('failed'))

      await adminController.verifyTutor(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ message: 'failed' })
    })
  })

  describe('getPendingTutors', () => {
    it('should return pending tutors', async () => {
      const tutors = [{ id: 1, name: 'Tutor A' }]
      const req = {}
      const res = createResponse()

      userService.getPendingTutors.mockResolvedValue(tutors)

      await adminController.getPendingTutors(req, res)

      expect(userService.getPendingTutors).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith({
        message: 'Pending tutors',
        data: tutors,
      })
    })
  })

  describe('getStats', () => {
    it('should return stats', async () => {
      const req = {}
      const res = createResponse()

      await adminController.getStats(req, res)

      expect(res.json).toHaveBeenCalled()
    })
  })

  describe('getAdminId', () => {
    it('should return admin id when found', async () => {
      const req = {}
      const res = createResponse()

      db.query.mockResolvedValue({ rows: [{ id: 999 }] })

      await adminController.getAdminId(req, res)

      expect(db.query).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith({ adminId: 999 })
    })

    it('should return 404 if no admin found', async () => {
      const req = {}
      const res = createResponse()

      db.query.mockResolvedValue({ rows: [] })

      await adminController.getAdminId(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalled()
    })
  })
})