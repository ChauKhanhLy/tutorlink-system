import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const PaymentService = {
  processPaymentLogic: jest.fn(),
  createVNPayUrl: jest.fn(),
}

const Booking = {
  findByPk: jest.fn(),
  update: jest.fn(),
}

jest.unstable_mockModule('../src/services/payment.service.js', () => PaymentService)
jest.unstable_mockModule('../src/models/booking.model.js', () => ({ default: Booking }))

const paymentController = await import('../src/controllers/payment.controller.js')

const createResponse = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
    send: jest.fn(),
  }
  res.status.mockReturnValue(res)
  return res
}

describe('Payment Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('postPayment success', async () => {
    Booking.findByPk.mockResolvedValue({
      learner_id: 1,
      tutor_id: 2,
    })

    PaymentService.processPaymentLogic.mockResolvedValue({
      paymentId: 1,
    })

    const req = {
      body: {
        booking_id: 10,
        amount: 100,
      },
    }
    const res = createResponse()

    await paymentController.postPayment(req, res)

    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('postPayment booking not found', async () => {
    Booking.findByPk.mockResolvedValue(null)

    const req = {
      body: { booking_id: 10 },
    }
    const res = createResponse()

    await paymentController.postPayment(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('createPaymentUrl success', async () => {
    Booking.findByPk.mockResolvedValue({ id: 1 })

    PaymentService.createVNPayUrl.mockResolvedValue('https://test.com')

    const req = {
      body: { booking_id: 1 },
      headers: {},
      socket: { remoteAddress: '127.0.0.1' },
    }
    const res = createResponse()

    await paymentController.createPaymentUrl(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('vnpayReturn success', async () => {
    Booking.update.mockResolvedValue([1])

    const req = {
      query: {
        vnp_ResponseCode: '00',
        vnp_TxnRef: '10',
      },
    }
    const res = createResponse()

    await paymentController.vnpayReturn(req, res)

    expect(Booking.update).toHaveBeenCalled()
    expect(res.send).toHaveBeenCalled()
  })
})