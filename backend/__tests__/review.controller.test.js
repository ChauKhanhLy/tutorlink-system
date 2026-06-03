import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const ReviewService = {
  createReview: jest.fn(),
  getReviewsByTutor: jest.fn(),
  getReviewsByBooking: jest.fn(),
}

jest.unstable_mockModule('../src/services/review.service.js', () => ReviewService)

const reviewController = await import('../src/controllers/review.controller.js')

const createResponse = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  }
  res.status.mockReturnValue(res)
  return res
}

describe('Review Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('postReview success', async () => {
    ReviewService.createReview.mockResolvedValue({ id: 1 })

    const req = {
      user: { id: 1 },
      body: {
        booking_id: 1,
        rating: 5,
        comment: 'good',
      },
    }
    const res = createResponse()

    await reviewController.postReview(req, res)

    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('postReview missing rating', async () => {
    const req = {
      user: { id: 1 },
      body: {},
    }
    const res = createResponse()

    await reviewController.postReview(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('getReviewsByTutor success', async () => {
    ReviewService.getReviewsByTutor.mockResolvedValue([{ id: 1 }])

    const req = {
      query: { tutorId: 1 },
    }
    const res = createResponse()

    await reviewController.getReviewsByTutor(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('getReviewsByBooking success', async () => {
    ReviewService.getReviewsByBooking.mockResolvedValue([{ id: 1 }])

    const req = {
      query: { bookingId: 1 },
    }
    const res = createResponse()

    await reviewController.getReviewsByBooking(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
  })
})