import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const tutorAvailabilityService = {
  buildAvailabilitySlots: jest.fn(),
  saveAvailabilityPreferences: jest.fn(),
}

const tutorDAL = {
  getTutorById: jest.fn(),
}

const db = {
  query: jest.fn(),
}

jest.unstable_mockModule('../src/services/tutorAvailability.service.js', () => tutorAvailabilityService)
jest.unstable_mockModule('../src/dal/tutor.dal.js', () => tutorDAL)
jest.unstable_mockModule('../src/config/db.js', () => ({ default: db }))

const tutorController = await import('../src/controllers/tutor.controller.js')

const createResponse = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  }
  res.status.mockReturnValue(res)
  return res
}

describe('tutor controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getTutorById', () => {
    it('returns tutor detail when tutor exists', async () => {
      const req = { params: { id: '1' } }
      const res = createResponse()
      tutorDAL.getTutorById.mockResolvedValue({ id: 1, name: 'Tutor Name' })

      await tutorController.getTutorById(req, res)

      expect(tutorDAL.getTutorById).toHaveBeenCalledWith('1')
      expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'Tutor Name' })
    })

    it('returns 404 when tutor not found', async () => {
      const req = { params: { id: '99' } }
      const res = createResponse()
      tutorDAL.getTutorById.mockResolvedValue(null)

      await tutorController.getTutorById(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
    })
  })

  describe('getTutorStats', () => {
    it('returns 401 when unauthorized', async () => {
      const req = {}
      const res = createResponse()

      await tutorController.getTutorStats(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
    })

    it('returns computed stats for authorized tutor', async () => {
      const req = { user: { id: '123' } }
      const res = createResponse()

      db.query
        .mockResolvedValueOnce({ rows: [{ count: '2' }] }) // todaySessions
        .mockResolvedValueOnce({ rows: [{ count: '5' }] }) // totalStudents
        .mockResolvedValueOnce({ rows: [{ total: '300000' }] }) // monthlyEarnings
        .mockResolvedValueOnce({ rows: [{ avg_rating: '4.5' }] }) // avgRating

      await tutorController.getTutorStats(req, res)

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          todaySessions: 2,
          totalStudents: 5,
          monthlyEarnings: 300000,
          avgRating: 4.5,
        },
      })
    })
  })

  describe('getTutorAvailability', () => {
    it('returns buildAvailabilitySlots output', async () => {
      const req = { params: { id: '123' }, query: { days: '30' } }
      const res = createResponse()
      const slots = [{ date: '2026-06-01', slots: [] }]
      tutorAvailabilityService.buildAvailabilitySlots.mockResolvedValue(slots)

      await tutorController.getTutorAvailability(req, res)

      expect(tutorAvailabilityService.buildAvailabilitySlots).toHaveBeenCalledWith('123', 30)
      expect(res.json).toHaveBeenCalledWith(slots)
    })
  })
})
