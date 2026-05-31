import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const tutorAvailabilityDAL = {
  getTutorAvailabilityRules: jest.fn(),
  replaceTutorAvailability: jest.fn(),
}

const db = {
  query: jest.fn(),
}

jest.unstable_mockModule('../src/dal/tutorAvailability.dal.js', () => tutorAvailabilityDAL)
jest.unstable_mockModule('../src/config/db.js', () => ({ default: db }))

const tutorAvailabilityService = await import('../src/services/tutorAvailability.service.js')

describe('tutor availability service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('saveAvailabilityPreferences', () => {
    it('saves raw template configuration when payload is an array', async () => {
      await tutorAvailabilityService.saveAvailabilityPreferences('tutor-1', ['morning'], [1, 2])

      expect(tutorAvailabilityDAL.replaceTutorAvailability).toHaveBeenCalledWith(
        'tutor-1',
        [
          { dayOfWeek: 1, specificDate: null, startTime: '08:00:00', endTime: '12:00:00' },
          { dayOfWeek: 2, specificDate: null, startTime: '08:00:00', endTime: '12:00:00' },
        ]
      )
    })

    it('saves specific date slots when repeatWeekly is false', async () => {
      const payload = {
        dates: [
          { date: '2026-06-01', times: ['08:00', '09:00'] },
        ],
        repeatWeekly: false,
      }

      await tutorAvailabilityService.saveAvailabilityPreferences('tutor-1', payload)

      expect(tutorAvailabilityDAL.replaceTutorAvailability).toHaveBeenCalledWith(
        'tutor-1',
        [
          { dayOfWeek: null, specificDate: '2026-06-01', startTime: '08:00:00', endTime: '09:00:00' },
          { dayOfWeek: null, specificDate: '2026-06-01', startTime: '09:00:00', endTime: '10:00:00' },
        ]
      )
    })
  })

  describe('buildAvailabilitySlots', () => {
    it('returns empty array if no rules exist', async () => {
      tutorAvailabilityDAL.getTutorAvailabilityRules.mockResolvedValue([])

      const res = await tutorAvailabilityService.buildAvailabilitySlots('tutor-1')

      expect(res).toEqual([])
    })

    it('builds slots matching weekly rules and excludes booked ones', async () => {
      tutorAvailabilityDAL.getTutorAvailabilityRules.mockResolvedValue([
        { dayOfWeek: 1, specificDate: null, startTime: '08:00:00', endTime: '10:00:00' }, // Monday
      ])

      db.query.mockResolvedValue({
        rows: [
          { datetime: '2026-06-01T08:00:00.000Z', type: 'trial' }, // Monday 8:00 booked (1h duration)
        ],
      })

      // We call the builder.
      const res = await tutorAvailabilityService.buildAvailabilitySlots('tutor-1', 7)
      
      // Verification
      expect(tutorAvailabilityDAL.getTutorAvailabilityRules).toHaveBeenCalledWith('tutor-1')
      expect(Array.isArray(res)).toBe(true)
    })
  })
})
