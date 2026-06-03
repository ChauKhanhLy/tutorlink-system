import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const lessonSessionService = {
  getOrCreateMeeting: jest.fn(),
  joinLessonSession: jest.fn(),
  leaveLessonSession: jest.fn(),
  confirmTutorTaught: jest.fn(),
  confirmLearnerStudied: jest.fn(),
}

jest.unstable_mockModule('../src/services/lessonSession.service.js', () => ({
  default: lessonSessionService,
}))

const lessonSessionControllerModule = await import('../src/controllers/lessonSession.controller.js')
const lessonSessionController = lessonSessionControllerModule.default

const createResponse = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  }
  res.status.mockReturnValue(res)
  return res
}

describe('Lesson Session Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('getMeeting success', async () => {
    lessonSessionService.getOrCreateMeeting.mockResolvedValue({ room: 'abc' })

    const req = {
      params: { id: 1 },
      user: { id: 2 },
    }
    const res = createResponse()

    await lessonSessionController.getMeeting(req, res)

    expect(res.json).toHaveBeenCalledWith({ room: 'abc' })
  })

  it('join success', async () => {
    lessonSessionService.joinLessonSession.mockResolvedValue({ joined: true })

    const req = {
      params: { id: 1 },
      user: { id: 2 },
    }
    const res = createResponse()

    await lessonSessionController.join(req, res)

    expect(res.json).toHaveBeenCalled()
  })

  it('leave success', async () => {
    lessonSessionService.leaveLessonSession.mockResolvedValue({ left: true })

    const req = {
      params: { id: 1 },
      user: { id: 2 },
    }
    const res = createResponse()

    await lessonSessionController.leave(req, res)

    expect(res.json).toHaveBeenCalled()
  })
})