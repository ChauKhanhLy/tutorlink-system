import db from "../config/db.js";
import {
  getTutorAvailabilityRules,
  replaceTutorAvailability,
} from "../dal/tutorAvailability.dal.js";

const addOneHour = (time) => {
  const [hour, minute] = time.split(':').map(Number)
  let nextHour = hour + 1
  if (nextHour >= 24) nextHour = 23  
  return `${String(nextHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`
}

const normalizeTime = (time) => {
  return `${time}:00`;
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

export const saveAvailabilityPreferences = async (tutorId, payload) => {
  const { dates = [], repeatWeekly = false } = payload || {};
  const normalized = [];

  for (const item of dates) {
    const [year, month, day] = item.date.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
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

export const buildAvailabilitySlots = async (tutorId, daysAhead = 14) => {
  const rules = await getTutorAvailabilityRules(tutorId);
  if (!rules.length) return [];

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(today);
  endDate.setDate(today.getDate() + daysAhead);

  // CHỈ lấy các booking đã được XÁC NHẬN hoặc HOÀN THÀNH để chặn lịch
  // Điều này cho phép học viên đặt nhiều lịch 'pending' chồng chéo nhau
  const bookingsRes = await db.query(
    "SELECT datetime, type FROM bookings WHERE tutor_id = $1 AND datetime >= $2 AND datetime < $3 AND status IN ('confirmed', 'done')",
    [tutorId, today, endDate]
  );
  
  const bookings = bookingsRes.rows;

  const result = [];

  for (let i = 0; i < daysAhead; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const day = date.getDay();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const dayOfMonth = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${dayOfMonth}`;

    // Lọc rules cho ngày hiện tại
    const dayRules = rules.filter((rule) => {
        if (rule.specificDate) {
            const ruleDate = new Date(rule.specificDate).toISOString().split('T')[0];
            return ruleDate === dateStr;
        }
        return Number(rule.dayOfWeek) === day;
    });

    if (!dayRules.length) continue;

    let times = [
      ...new Set(dayRules.flatMap((rule) => toHourSlots(rule.startTime, rule.endTime)))
    ].sort();

    // Loại bỏ các giờ đã trôi qua nếu là hôm nay (theo giờ VN)
    if (i === 0) {
      const vnNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
      const currentHour = vnNow.getHours();
      times = times.filter(t => parseInt(t.split(':')[0]) > currentHour);
    }

    if (!times.length) continue;

    // Lọc bỏ các slot đã bị chiếm bởi lịch đã confirm
    const bookedForDay = bookings.filter(b => {
        const d = new Date(b.datetime);
        const options = { timeZone: "Asia/Ho_Chi_Minh", year: 'numeric', month: '2-digit', day: '2-digit' };
        const dateStrLocal = new Intl.DateTimeFormat('en-CA', options).format(d); // YYYY-MM-DD
        return dateStrLocal === dateStr;
    });

    times = times.filter(time => {
      const [hour, minute] = time.split(':').map(Number);
      const slotStart = new Date(`${dateStr}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00+07:00`);
      
      return !bookedForDay.some(booked => {
        const bStart = new Date(booked.datetime);
        const bDuration = booked.type === 'trial' ? 50 : 120;
        const bEnd = new Date(bStart.getTime() + bDuration * 60000);
        
        // Trùng nếu slotStart nằm trong khoảng của một booking đã có
        // Hoặc nếu một slot Hourly (1 tiếng) đè lên booking đó
        const slotEnd = new Date(slotStart.getTime() + 60 * 60000);
        
        const isOverlapping = (slotStart < bEnd && slotEnd > bStart);
        return isOverlapping;
      });
    });

    if (!times.length) continue;

    result.push({
      date: dateStr,
      times,
    });
  }

  return result;
};
