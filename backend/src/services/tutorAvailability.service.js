import db from "../config/db.js";
import {
  getTutorAvailabilityRules,
  replaceTutorAvailability,
} from "../dal/tutorAvailability.dal.js";

const addOneHour = (time) => {
  const [hour, minute] = time.split(":").map(Number);

  const nextHour = hour + 1;

  return `${String(nextHour).padStart(2, "0")}:${String(minute).padStart(
    2,
    "0",
  )}:00`;
};

const normalizeTime = (time) => {
  return `${time}:00`;
};

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
export const saveAvailabilityPreferences = async (tutorId, payload) => {
  const { dates = [], repeatWeekly = false } = payload || {};

  const normalized = [];

  for (const item of dates) {
    const dateObj = new Date(item.date);

    const dayOfWeek = dateObj.getDay();

    for (const time of item.times || []) {
      normalized.push({
        dayOfWeek: repeatWeekly ? dayOfWeek : null,

        specificDate: repeatWeekly ? null : item.date,

        startTime: normalizeTime(time),

        endTime: addOneHour(time),
      });
    }
  }

  await replaceTutorAvailability(tutorId, normalized);
};

const toHourSlots = (startTime, endTime) => {
  const startHour = parseInt(String(startTime).split(":")[0]);

  const endHour = parseInt(String(endTime).split(":")[0]);

  const slots = [];

  if (isNaN(startHour) || isNaN(endHour)) {
    return [];
  }

  for (let hour = startHour; hour < endHour; hour += 1) {
    slots.push(`${String(hour).padStart(2, "0")}:00`);
  }

  return slots;
};

export const buildAvailabilitySlots = async (tutorId, daysAhead = 14) => {
  const rules = await getTutorAvailabilityRules(tutorId);

  if (!rules.length) return [];

  const now = new Date();

  const today = new Date(now);

  today.setHours(0, 0, 0, 0);

  const result = [];

  for (let i = 0; i < daysAhead; i += 1) {
    const date = new Date(today);

    date.setDate(today.getDate() + i);

    const dayOfWeek = date.getDay();

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    const dateStr = `${year}-${month}-${day}`;

    // recurring weekly rules
    const weeklyRules = rules.filter(
      (rule) => rule.dayOfWeek !== null && Number(rule.dayOfWeek) === dayOfWeek,
    );

    // exact specific_date rules
    const specificDateRules = rules.filter((rule) => {
      if (!rule.specificDate) return false;

      const ruleDate = new Date(rule.specificDate).toISOString().split("T")[0];

      return ruleDate === dateStr;
    });

    // merge cả 2
    const mergedRules = [...weeklyRules, ...specificDateRules];

    if (!mergedRules.length) continue;

    let times = [
      ...new Set(
        mergedRules.flatMap((rule) =>
          toHourSlots(rule.startTime, rule.endTime),
        ),
      ),
    ].sort();

    // remove passed hours today
    if (i === 0) {
      const currentHour = now.getHours();

      times = times.filter((t) => parseInt(t.split(":")[0]) > currentHour);
    }

    if (!times.length) continue;

    result.push({
      date: dateStr,
      times,
    });
  }

  return result;
};
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

  const endDate = new Date(today)
  endDate.setDate(today.getDate() + daysAhead)

  // Lấy các booking đã tồn tại
  const bookingsRes = await db.query(
    "SELECT datetime FROM bookings WHERE tutor_id = $1 AND datetime >= $2 AND datetime < $3 AND status != 'cancelled'",
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

    // Lọc bỏ các slot đã bị book (tính đến khoảng cách 2 tiếng)
    const bookedTimesForDay = bookedSlots.filter(b => b.date === dateStr).map(b => b.time);
    times = times.filter(time => {
      const timeHour = parseInt(time.split(':')[0]);
      
      // Kiểm tra xem time có bị ảnh hưởng bởi booked slot nào không
      return !bookedTimesForDay.some(bookedTime => {
        const bookedHour = parseInt(bookedTime.split(':')[0]);
        
        // Nếu time bắt đầu trong khoảng 2 tiếng của booked time -> bị ảnh hưởng
        // Ví dụ: booked 8:00, các slot 6:00-9:59 đều bị ảnh hưởng
        return timeHour >= bookedHour - 2 && timeHour <= bookedHour + 1;
      });
    });

    if (!times.length) continue

    result.push({
      date: dateStr,
      times
    })
  }

  return result
}*/
