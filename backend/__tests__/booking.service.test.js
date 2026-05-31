import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const bookingModel = {
  findOne: jest.fn(),
  findByPk: jest.fn(),
}

const videoRoomModel = {
  findOne: jest.fn(),
  create: jest.fn(),
}

const db = {
  query: jest.fn(),
  connect: jest.fn(),
}

const walletService = {
  spendFromWallet: jest.fn(),
}

jest.unstable_mockModule('../src/models/booking.model.js', () => ({ default: bookingModel }))
jest.unstable_mockModule('../src/models/videoRoom.model.js', () => ({ default: videoRoomModel }))
jest.unstable_mockModule('../src/config/db.js', () => ({ default: db }))
jest.unstable_mockModule('./wallet.service.js', () => walletService)

const bookingService = await import('../src/services/booking.service.js')

describe('booking service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getTutorSubjects', () => {
    it('returns rows of subjects from db', async () => {
      db.query.mockResolvedValue({ rows: [{ subject_id: 1 }, { subject_id: 2 }] })

      const res = await bookingService.getTutorSubjects(123)

      expect(db.query).toHaveBeenCalledWith(
        'SELECT subject_id FROM tutor_subjects WHERE tutor_id = $1',
        [123]
      )
      expect(res).toEqual([{ subject_id: 1 }, { subject_id: 2 }])
    })
  })

  describe('createBooking', () => {
    it('throws error when trial limit is exceeded', async () => {
      bookingModel.findOne.mockResolvedValue({ id: 99 }) // Existent confirmed/pending trial

      await expect(
        bookingService.createBooking({
          learner_id: 'learner-1',
          tutor_id: 'tutor-1',
          datetime: '2026-06-01T08:00:00.000Z',
          type: 'trial',
        })
      ).rejects.toThrow('Bạn đã hết lượt học thử với gia sư này')
    })
  })
})
