import {
  getTutorAvailabilityRules,
  replaceTutorAvailability,
} from '../dal/tutorAvailability.dal.js'

const addOneHour = (time) => {
  const [hour, minute] = time.split(':').map(Number)

  const nextHour = hour + 1

  return `${String(nextHour).padStart(2, '0')}:${String(
    minute
  ).padStart(2, '0')}:00`
}

const normalizeTime = (time) => {
  return `${time}:00`
}

/**
 * Payload frontend:
 * {
 *   dates: [
 *     {
 *       date: "2026-05-10",
 *       times: ["08:00", "09:00"]
 *     }
 *   ],
 *   repeatWeekly: true
 * }
 */
export const saveAvailabilityPreferences = async (
  tutorId,
  payload
) => {
  const {
    dates = [],
    repeatWeekly = false,
  } = payload || {}

  const normalized = []

  for (const item of dates) {
    const dateObj = new Date(item.date)

    const dayOfWeek = dateObj.getDay()

    for (const time of item.times || []) {
      normalized.push({
        dayOfWeek: repeatWeekly
          ? dayOfWeek
          : null,

        specificDate: repeatWeekly
          ? null
          : item.date,

        startTime: normalizeTime(time),

        endTime: addOneHour(time),
      })
    }
  }

  await replaceTutorAvailability(
    tutorId,
    normalized
  )
}

const toHourSlots = (startTime, endTime) => {
  const startHour = parseInt(
    String(startTime).split(':')[0]
  )

  const endHour = parseInt(
    String(endTime).split(':')[0]
  )

  const slots = []

  if (isNaN(startHour) || isNaN(endHour)) {
    return []
  }

  for (
    let hour = startHour;
    hour < endHour;
    hour += 1
  ) {
    slots.push(
      `${String(hour).padStart(2, '0')}:00`
    )
  }

  return slots
}

export const buildAvailabilitySlots = async (
  tutorId,
  daysAhead = 14
) => {
  const rules =
    await getTutorAvailabilityRules(tutorId)

  if (!rules.length) return []

  const now = new Date()

  const today = new Date(now)

  today.setHours(0, 0, 0, 0)

  const result = []

  for (let i = 0; i < daysAhead; i += 1) {
    const date = new Date(today)

    date.setDate(today.getDate() + i)

    const dayOfWeek = date.getDay()

    const year = date.getFullYear()

    const month = String(
      date.getMonth() + 1
    ).padStart(2, '0')

    const day = String(
      date.getDate()
    ).padStart(2, '0')

    const dateStr = `${year}-${month}-${day}`

    // recurring weekly rules
    const weeklyRules = rules.filter(
      (rule) =>
        rule.dayOfWeek !== null &&
        Number(rule.dayOfWeek) === dayOfWeek
    )

    // exact specific_date rules
    const specificDateRules = rules.filter(
      (rule) =>
        rule.specificDate &&
        rule.specificDate === dateStr
    )

    // merge cả 2
    const mergedRules = [
      ...weeklyRules,
      ...specificDateRules,
    ]

    if (!mergedRules.length) continue

    let times = [
      ...new Set(
        mergedRules.flatMap((rule) =>
          toHourSlots(
            rule.startTime,
            rule.endTime
          )
        )
      ),
    ].sort()

    // remove passed hours today
    if (i === 0) {
      const currentHour = now.getHours()

      times = times.filter(
        (t) =>
          parseInt(t.split(':')[0]) >
          currentHour
      )
    }

    if (!times.length) continue

    result.push({
      date: dateStr,
      times,
    })
  }

  return result
}
/*import { getTutorAvailabilityRules, replaceTutorAvailability } from '../dal/tutorAvailability.dal.js'

const AVAILABILITY_TEMPLATES = {
  morning: { startTime: '08:00:00', endTime: '12:00:00' },
  afternoon: { startTime: '13:00:00', endTime: '17:00:00' },
  evening: { startTime: '18:00:00', endTime: '22:00:00' },
}

const toHourSlots = (startTime, endTime) => {
  const startHour = parseInt(String(startTime).split(':')[0])
  const endHour = parseInt(String(endTime).split(':')[0])
  const slots = []

  if (isNaN(startHour) || isNaN(endHour)) return []

  for (let hour = startHour; hour < endHour; hour += 1) {
    slots.push(`${String(hour).padStart(2, '0')}:00`)
  }

  return slots
}

export const saveAvailabilityPreferences = async (tutorId, timeSlots = [], availableDays = []) => {
  // Luôn xóa lịch cũ trước khi lưu mới
  await replaceTutorAvailability(tutorId, [])

  if (!timeSlots.length || !availableDays.length) {
    return;
  }

  const normalized = []
  for (const slot of timeSlots) {
    const template = AVAILABILITY_TEMPLATES[slot]
    if (!template) continue

    for (const dayOfWeek of availableDays) {
      normalized.push({
        dayOfWeek,
        startTime: template.startTime,
        endTime: template.endTime
      })
    }
  }

  if (normalized.length > 0) {
    await replaceTutorAvailability(tutorId, normalized)
  }
}

export const buildAvailabilitySlots = async (tutorId, daysAhead = 14) => {
  const rules = await getTutorAvailabilityRules(tutorId)
  if (!rules.length) return []

  const now = new Date()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  const result = []

  for (let i = 0; i < daysAhead; i += 1) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const day = date.getDay()

    const dayRules = rules.filter((rule) => Number(rule.day_of_week) === day)
    if (!dayRules.length) continue

    let times = [
      ...new Set(dayRules.flatMap((rule) => toHourSlots(rule.start_time, rule.end_time)))
    ].sort()

    // Nếu là ngày hôm nay, chỉ hiện các khung giờ chưa trôi qua
    if (i === 0) {
      const currentHour = now.getHours()
      times = times.filter(t => parseInt(t.split(':')[0]) > currentHour)
    }

    if (!times.length) continue

    // Fix timezone issue: use local date string (YYYY-MM-DD)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const dayOfMonth = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${dayOfMonth}`

    result.push({
      date: dateStr,
      times
    })
  }

  return result
}*/
