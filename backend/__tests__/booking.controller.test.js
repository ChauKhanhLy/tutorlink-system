import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const bookingService = {
  createBooking: jest.fn(),
  getBookingsForTutor: jest.fn(),
  getMyBookings: jest.fn(),
  updateStatus: jest.fn(),
  getBookingById: jest.fn(),
  getTutorSubjects: jest.fn(),
}

const walletService = {
  getOrCreateWallet: jest.fn(),
}

const db = {
  query: jest.fn(),
}

const lessonSessionService = {
  confirmTutorTaught: jest.fn(),
  confirmLearnerStudied: jest.fn(),
}

jest.unstable_mockModule('../src/services/booking.service.js', () => bookingService)
jest.unstable_mockModule('../src/services/wallet.service.js', () => walletService)
jest.unstable_mockModule('../src/services/lessonSession.service.js', () => ({ default: lessonSessionService }))
jest.unstable_mockModule('../src/config/db.js', () => ({ default: db }))

const bookingController = await import('../src/controllers/booking.controller.js')

const createResponse = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  }
  res.status.mockReturnValue(res)
  return res
}

describe('booking controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('postBooking', () => {
    it('returns 400 when missing tutor or datetime', async () => {
      const req = { user: { id: '1' }, body: {} }
      const res = createResponse()

      await bookingController.postBooking(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.any(String) })
      )
    })
  })

  describe('getMyBookings', () => {
    it('returns 401 when unauthorized', async () => {
      const req = {}
      const res = createResponse()

      await bookingController.getMyBookings(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
    })

    it('fetches tutor bookings if user has role tutor', async () => {
      const req = { user: { id: 'tutor-1', role: 'tutor' } }
      const res = createResponse()
      bookingService.getBookingsForTutor.mockResolvedValue([])

      await bookingController.getMyBookings(req, res)

      expect(bookingService.getBookingsForTutor).toHaveBeenCalledWith('tutor-1')
      expect(res.status).toHaveBeenCalledWith(200)
    })
  })

  describe('acceptBooking', () => {
    it('returns 404 when booking not found', async () => {
      const req = { params: { id: '99' }, user: { id: 'tutor-1' } }
      const res = createResponse()
      db.query.mockResolvedValue({ rows: [] })

      await bookingController.acceptBooking(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
    })
  })
})
