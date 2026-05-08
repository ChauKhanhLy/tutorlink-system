import { getTutorAvailabilityRules, replaceTutorAvailability } from '../dal/tutorAvailability.dal.js'
import db from '../config/db.js'

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

  const endDate = new Date(today)
  endDate.setDate(today.getDate() + daysAhead)

  // Lấy các booking đã tồn tại
  const bookingsRes = await db.query(
    "SELECT datetime FROM bookings WHERE tutor_id = $1 AND datetime >= $2 AND datetime < $3 AND status != 'cancel'",
    [tutorId, today, endDate]
  )
  const bookedSlots = bookingsRes.rows.map(row => {
    const d = new Date(row.datetime);
    // Sử dụng múi giờ Việt Nam để trích xuất ngày và giờ, đảm bảo so khớp đúng với khung giờ string
    const options = { timeZone: "Asia/Ho_Chi_Minh", year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(d);
    const p = {};
    parts.forEach(({ type, value }) => p[type] = value);
    
    const dateStr = `${p.year}-${p.month}-${p.day}`;
    const hour = p.hour === '24' ? '00' : p.hour;
    const timeStr = `${hour}:${p.minute}`;
    
    return { date: dateStr, time: timeStr };
  });

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

    // Nếu là ngày hôm nay, chỉ hiện các khung giờ chưa trôi qua (theo giờ VN)
    if (i === 0) {
      const vnNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
      const currentHour = vnNow.getHours();
      times = times.filter(t => parseInt(t.split(':')[0]) > currentHour)
    }

    if (!times.length) continue

    // Fix timezone issue: use local date string (YYYY-MM-DD)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const dayOfMonth = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${dayOfMonth}`

    // Lọc bỏ các slot đã bị book
    const bookedTimesForDay = bookedSlots.filter(b => b.date === dateStr).map(b => b.time);
    times = times.filter(t => !bookedTimesForDay.includes(t));

    if (!times.length) continue

    result.push({
      date: dateStr,
      times
    })
  }

  return result
}
