import { buildAvailabilitySlots, saveAvailabilityPreferences } from '../services/tutorAvailability.service.js'
import { getTutorById as getTutorByIdDAL } from '../dal/tutor.dal.js'
import { getTutorAvailabilityRules } from '../dal/tutorAvailability.dal.js'

export const getTutorById = async (req, res) => {
  try {
    const { id } = req.params
    const tutor = await getTutorByIdDAL(id)
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" })
    }
    res.json(tutor)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

import db from '../config/db.js'

export const getTutorStats = async (req, res) => {
  try {
    const tutorId = req.user?.id;
    if (!tutorId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Today Sessions
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const todayRes = await db.query(
      "SELECT count(*) FROM bookings WHERE tutor_id = $1 AND datetime >= $2 AND datetime < $3 AND status != 'cancel'",
      [tutorId, todayStart, todayEnd]
    );

    // Total Students
    const studentsRes = await db.query(
      "SELECT count(DISTINCT learner_id) FROM bookings WHERE tutor_id = $1 AND status != 'cancel'",
      [tutorId]
    );

    // Monthly Earnings
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const earningsRes = await db.query(
      "SELECT COALESCE(sum(fee), 0) as total FROM bookings WHERE tutor_id = $1 AND datetime >= $2 AND status != 'cancel'",
      [tutorId, monthStart]
    );

    // Average Rating
    const ratingRes = await db.query(
      `SELECT COALESCE(AVG(r.rating), 0) as avg_rating 
       FROM reviews r 
       JOIN bookings b ON r.booking_id = b.id 
       WHERE b.tutor_id = $1`,
      [tutorId]
    );

    res.json({
      success: true,
      data: {
        todaySessions: parseInt(todayRes.rows[0].count),
        totalStudents: parseInt(studentsRes.rows[0].count),
        monthlyEarnings: parseFloat(earningsRes.rows[0].total),
        avgRating: parseFloat(ratingRes.rows[0].avg_rating)
      }
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export const getTutorAvailability = async (req, res) => {
  try {
    const { id } = req.params
    const slots = await buildAvailabilitySlots(id)
    res.json(slots)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getMyAvailabilityPreferences = async (req, res) => {
  try {
    const tutorId = req.user?.id;
    if (!tutorId) return res.status(401).json({ message: "Unauthorized" });

    const rules = await getTutorAvailabilityRules(tutorId);
    
    const schedule = {};
    for (const rule of rules) {
      let slotName = null;
      if (rule.start_time.startsWith('08')) slotName = 'morning';
      else if (rule.start_time.startsWith('13')) slotName = 'afternoon';
      else if (rule.start_time.startsWith('18')) slotName = 'evening';

      if (slotName) {
        if (!schedule[rule.day_of_week]) schedule[rule.day_of_week] = [];
        schedule[rule.day_of_week].push(slotName);
      }
    }
    
    res.json({ schedule });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export const updateMyAvailability = async (req, res) => {
  try {
    const tutorId = req.user?.id;
    if (!tutorId) return res.status(401).json({ message: "Unauthorized" });

    const { schedule } = req.body;
    await saveAvailabilityPreferences(tutorId, schedule);
    res.json({ success: true, message: "Cập nhật lịch rảnh thành công" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
