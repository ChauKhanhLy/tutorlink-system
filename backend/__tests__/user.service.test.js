import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const userDAL = {
  findById: jest.fn(),
  updateUser: jest.fn(),
  updateAvatar: jest.fn(),
}

const db = {
  query: jest.fn(),
}

const tutorAvailabilityService = {
  saveAvailabilityPreferences: jest.fn(),
}

jest.unstable_mockModule('../src/dal/user.dal.js', () => userDAL)
jest.unstable_mockModule('../src/config/db.js', () => ({ default: db }))
jest.unstable_mockModule('./tutorAvailability.service.js', () => tutorAvailabilityService)

const userService = await import('../src/services/user.service.js')

describe('user service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('updateProfile', () => {
    it('throws when user not found', async () => {
      userDAL.findById.mockResolvedValue(null)
      await expect(userService.updateProfile(1, { name: 'Name' })).rejects.toThrow('User not found')
    })

    it('updates user when user exists', async () => {
      userDAL.findById.mockResolvedValue({ id: 1 })
      userDAL.updateUser.mockResolvedValue({ id: 1, name: 'Name' })

      const res = await userService.updateProfile(1, { name: 'Name' })

      expect(userDAL.updateUser).toHaveBeenCalledWith(1, { name: 'Name' })
      expect(res).toEqual({ id: 1, name: 'Name' })
    })
  })

  describe('becomeTutor', () => {
    it('throws when user not found', async () => {
      userDAL.findById.mockResolvedValue(null)
      await expect(userService.becomeTutor(1, {})).rejects.toThrow('User not found')
    })

    it('creates tutor profile and registers tutor subjects', async () => {
      userDAL.findById.mockResolvedValue({ id: 1, verified: false })
      userDAL.updateUser.mockResolvedValue({ id: 1, role: 'tutor' })
      db.query.mockResolvedValue({ rows: [] }) // select existing profile -> empty
      
      const payload = {
        phone: '123456',
        bio: 'Bio',
        hourlyRate: 150000,
        subjects: ['Math'],
        availability: [{ date: '2026-06-01', times: ['08:00'] }],
      }

      db.query.mockResolvedValueOnce({ rows: [] }) // query tutor_profiles
      db.query.mockResolvedValueOnce({ rows: [] }) // query subjects for 'Math'
      db.query.mockResolvedValueOnce({ rows: [{ id: 101 }] }) // insert new subject

      const res = await userService.becomeTutor(1, payload)

      expect(userDAL.updateUser).toHaveBeenCalledWith(1, {
        role: 'tutor',
        verified: false,
        phone: '123456',
        avatar: undefined,
      })
      expect(res.message).toBe('Requested to become tutor')
    })
  })

  describe('verifyTutor', () => {
    it('throws when ID is not valid UUID', async () => {
      await expect(userService.verifyTutor('invalid-id')).rejects.toThrow('Invalid user ID')
    })

    it('throws when tutor not found', async () => {
      await expect(userService.verifyTutor('12345678-1234-1234-1234-123456789012')).rejects.toThrow('User not found')
    })
  })
})
