import { getTutorAvailabilityRules, replaceTutorAvailability } from '../dal/tutorAvailability.dal.js'

const AVAILABILITY_TEMPLATES = {
  morning: { startTime: '08:00:00', endTime: '12:00:00', days: [1, 2, 3, 4, 5] },
  afternoon: { startTime: '13:00:00', endTime: '17:00:00', days: [1, 2, 3, 4, 5] },
  evening: { startTime: '18:00:00', endTime: '22:00:00', days: [1, 2, 3, 4, 5] },
  weekend: { startTime: '08:00:00', endTime: '22:00:00', days: [0, 6] }
}

const toHourSlots = (startTime, endTime) => {
  const startHour = Number(String(startTime).slice(0, 2))
  const endHour = Number(String(endTime).slice(0, 2))
  const slots = []

  for (let hour = startHour; hour < endHour; hour += 1) {
    slots.push(`${String(hour).padStart(2, '0')}:00`)
  }

  return slots
}

export const saveAvailabilityPreferences = async (tutorId, preferences = []) => {
  const normalized = []

  for (const preference of preferences) {
    const template = AVAILABILITY_TEMPLATES[preference]
    if (!template) continue

    for (const dayOfWeek of template.days) {
      normalized.push({
        dayOfWeek,
        startTime: template.startTime,
        endTime: template.endTime
      })
    }
  }

  await replaceTutorAvailability(tutorId, normalized)
}

export const buildAvailabilitySlots = async (tutorId, daysAhead = 14) => {
  const rules = await getTutorAvailabilityRules(tutorId)
  if (!rules.length) return []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const result = []

  for (let i = 0; i < daysAhead; i += 1) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const day = date.getDay()

    const dayRules = rules.filter((rule) => Number(rule.day_of_week) === day)
    if (!dayRules.length) continue

    const times = [
      ...new Set(dayRules.flatMap((rule) => toHourSlots(rule.start_time, rule.end_time)))
    ].sort()

    if (!times.length) continue

    result.push({
      date: date.toISOString().slice(0, 10),
      times
    })
  }

  return result
}
