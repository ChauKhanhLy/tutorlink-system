import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userDAL = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  updatePassword: jest.fn(),
}

const transporter = {
  sendMail: jest.fn(),
}

jest.unstable_mockModule('../src/dal/user.dal.js', () => userDAL)
jest.unstable_mockModule('../src/services/mail.service.js', () => ({ transporter }))

const authService = await import('../src/services/auth.service.js')

describe('auth service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('throws when login is missing email or password', async () => {
    await expect(
      authService.login({ email: 'learner@example.com' })
    ).rejects.toThrow('Missing email or password')
  })

  it('throws when login email does not exist', async () => {
    userDAL.findByEmail.mockResolvedValue(undefined)

    await expect(
      authService.login({
        email: 'missing@example.com',
        password: 'password123',
      })
    ).rejects.toThrow('User not found')
  })

  it('throws when login password is wrong', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10)

    userDAL.findByEmail.mockResolvedValue({
      id: 1,
      email: 'learner@example.com',
      password: hashedPassword,
      role: 'learner',
    })

    await expect(
      authService.login({
        email: 'learner@example.com',
        password: 'wrong-password',
      })
    ).rejects.toThrow('Wrong password')
  })

  it('returns a token and public user data when login succeeds', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10)
    const user = {
      id: 1,
      email: 'learner@example.com',
      password: hashedPassword,
      name: 'Learner',
      role: 'learner',
      verified: true,
      email_verified: true,
    }

    userDAL.findByEmail.mockResolvedValue(user)

    const result = await authService.login({
      email: 'learner@example.com',
      password: 'password123',
    })

    expect(result.user).toMatchObject({
      id: 1,
      email: 'learner@example.com',
      name: 'Learner',
      role: 'learner',
      verified: true,
      email_verified: true,
    })
    expect(result.user.password).toBeUndefined()
    expect(jwt.verify(result.token, process.env.JWT_SECRET)).toMatchObject({
      id: 1,
      role: 'learner',
    })
  })

  it('creates a pending learner registration and sends an OTP email', async () => {
    jest.useFakeTimers()
    userDAL.findByEmail.mockResolvedValue(undefined)
    transporter.sendMail.mockResolvedValue({ messageId: 'mail-id' })

    const result = await authService.registerLearner({
      email: 'new-learner@example.com',
      password: 'password123',
      name: 'New Learner',
    })

    expect(result).toEqual({ message: 'OTP sent successfully' })
    expect(transporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'new-learner@example.com',
        subject: 'TutorLink OTP',
      })
    )
  })

  it('changes password when current password is valid', async () => {
    const hashedPassword = await bcrypt.hash('old-password', 10)

    userDAL.findById.mockResolvedValue({
      id: 1,
      password: hashedPassword,
    })
    userDAL.updatePassword.mockResolvedValue(undefined)

    await expect(
      authService.changePassword(1, 'old-password', 'new-password')
    ).resolves.toBe(true)

    expect(userDAL.updatePassword).toHaveBeenCalledWith(
      1,
      expect.any(String)
    )
  })
})
