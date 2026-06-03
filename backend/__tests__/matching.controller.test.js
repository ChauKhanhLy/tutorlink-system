import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const matchingService = {
  getTutors: jest.fn(),
}

jest.unstable_mockModule('../src/services/matching.service.js', () => matchingService)

const matchingController = await import('../src/controllers/matching.controller.js')

const createResponse = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  }
  res.status.mockReturnValue(res)
  return res
}

describe('Matching Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return tutors', async () => {
    const tutors = [{ id: 1, name: 'Tutor A' }]

    matchingService.getTutors.mockResolvedValue(tutors)

    const req = {
      query: { subject: 'Math' },
    }
    const res = createResponse()

    await matchingController.getTutors(req, res)

    expect(matchingService.getTutors).toHaveBeenCalledWith(req.query)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Matching tutors',
      tutors,
    })
  })

  it('should return 400 when service throws', async () => {
    matchingService.getTutors.mockRejectedValue(new Error('service error'))

    const req = { query: {} }
    const res = createResponse()

    await matchingController.getTutors(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'service error' })
  })
})