import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const db = {
  query: jest.fn(),
}

jest.unstable_mockModule('../src/config/db.js', () => ({ default: db }))

const subjectController = await import('../src/controllers/subject.controller.js')

const createResponse = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  }
  res.status.mockReturnValue(res)
  return res
}

describe('Subject Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getSubjectById', () => {
    it('should return subject', async () => {
      db.query.mockResolvedValue({
        rows: [{ id: 1, name: 'Math' }],
      })

      const req = { params: { id: 1 } }
      const res = createResponse()

      await subjectController.getSubjectById(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should return 404', async () => {
      db.query.mockResolvedValue({ rows: [] })

      const req = { params: { id: 1 } }
      const res = createResponse()

      await subjectController.getSubjectById(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
    })
  })

  describe('getAllSubjects', () => {
    it('should return all subjects', async () => {
      db.query.mockResolvedValue({
        rows: [{ id: 1 }, { id: 2 }],
      })

      const res = createResponse()

      await subjectController.getAllSubjects({}, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [{ id: 1 }, { id: 2 }],
      })
    })
  })
})