import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const authService = {
  registerLearner: jest.fn(),
  registerTutor: jest.fn(),
  login: jest.fn(),
  verifyOTP: jest.fn(),
  resendOTP: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  changePassword: jest.fn(),
}

const userDAL = {
  findById: jest.fn(),
}

jest.unstable_mockModule('../src/services/auth.service.js', () => authService)
jest.unstable_mockModule('../src/dal/user.dal.js', () => userDAL)

const authController = await import('../src/controllers/auth.controller.js')

const createResponse = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  }

  res.status.mockReturnValue(res)
  return res
}

describe('auth controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('registers a learner and returns the service result', async () => {
    const req = {
      body: {
        email: 'learner@example.com',
        password: 'password123',
        name: 'Learner',
      },
    }
    const res = createResponse()
    const result = { message: 'OTP sent successfully' }

    authService.registerLearner.mockResolvedValue(result)

    await authController.default.registerLearner(req, res)

    expect(authService.registerLearner).toHaveBeenCalledWith(req.body)
    expect(res.json).toHaveBeenCalledWith(result)
    expect(res.status).not.toHaveBeenCalled()
  })

  it('returns 400 when learner registration fails', async () => {
    const req = {
      body: {
        email: 'learner@example.com',
        password: 'password123',
        name: 'Learner',
      },
    }
    const res = createResponse()

    authService.registerLearner.mockRejectedValue(new Error('User already exists'))

    await authController.default.registerLearner(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' })
  })

  it('logs in a user and returns token data', async () => {
    const req = {
      body: {
        email: 'learner@example.com',
        password: 'password123',
      },
    }
    const res = createResponse()
    const result = {
      token: 'jwt-token',
      user: { id: 1, email: 'learner@example.com', role: 'learner' },
    }

    authService.login.mockResolvedValue(result)

    await authController.default.login(req, res)

    expect(authService.login).toHaveBeenCalledWith(req.body)
    expect(res.json).toHaveBeenCalledWith(result)
  })

  it('returns 401 when login fails', async () => {
    const req = {
      body: {
        email: 'learner@example.com',
        password: 'wrong-password',
      },
    }
    const res = createResponse()

    authService.login.mockRejectedValue(new Error('Wrong password'))

    await authController.default.login(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Wrong password' })
  })

  it('returns the authenticated user from getMe', async () => {
    const req = { user: { id: 7 } }
    const res = createResponse()
    const user = { id: 7, email: 'learner@example.com', role: 'learner' }

    userDAL.findById.mockResolvedValue(user)

    await authController.getMe(req, res)

    expect(userDAL.findById).toHaveBeenCalledWith(7)
    expect(res.json).toHaveBeenCalledWith(user)
  })
})
