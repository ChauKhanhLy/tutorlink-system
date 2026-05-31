/*const userService = require('../services/user.service')

exports.verifyTutor = async (req, res) => {
  try {
    const userId = req.params.id

    const result = await userService.verifyTutor(userId)

    res.json(result)
  } catch (err) {
    res.status(400).json({
      message: err.message
    })
  }
}

// pending tutor
exports.getPendingTutors = async (req, res) => {
  try {
    const tutors = await userService.getPendingTutors()
    res.json(tutors)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}*/
//import userService from '../services/user.service.js'
import { verifyTutor as verifyTutorService, getPendingTutors as getPendingTutorsService } from '../services/user.service.js'
import db from '../config/db.js';
import * as bookingService from "../services/booking.service.js";

export const getAllBookingsAdmin = async (req, res) => {
  try {
    const bookings =
      await bookingService.getAllBookings();

    res.json(bookings);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Lỗi server",
    });
  }
};
export const verifyTutor = async (req, res) => {
  try {
    const userId = req.params.id
    const result = await verifyTutorService(userId)
    res.json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getPendingTutors = async (req, res) => {
  try {
    const tutors = await getPendingTutorsService()
    res.json({
      message: "Pending tutors",
      data: tutors
    })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getStats = async (req, res) => {
  try {
    // Mock stats for now
    res.json({
      message: "Admin stats",
      data: {
        total_learners: 150,
        total_tutors: 45,
        total_bookings: 320,
        total_revenue: 12500
      }
    })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getAllConversations = async (req, res) => {
  try {
    const adminId = process.env.ADMIN_ID;

    if (!adminId) {
      return res.status(500).json({ message: 'ADMIN_ID not configured' });
    }

    const query = `
      WITH last_messages AS (
        SELECT DISTINCT ON (
          CASE 
            WHEN sender_id = $1 THEN receiver_id 
            ELSE sender_id 
          END
        )
        id, sender_id, receiver_id, content, sent_at, is_read
        FROM messages
        WHERE sender_id = $1 OR receiver_id = $1
        ORDER BY 
          CASE 
            WHEN sender_id = $1 THEN receiver_id 
            ELSE sender_id 
          END,
          sent_at DESC
      ),
      unread_counts AS (
        SELECT sender_id, COUNT(*) as unread_count
        FROM messages
        WHERE receiver_id = $1 AND is_read = false
        GROUP BY sender_id
      )
      SELECT 
        u.id, 
        u.name, 
        u.avatar,
        lm.content as "lastMsg",
        lm.sent_at as "time",
        COALESCE(uc.unread_count, 0) as unread,
        u.role
      FROM last_messages lm
      JOIN users u ON u.id = (CASE WHEN lm.sender_id = $1 THEN lm.receiver_id ELSE lm.sender_id END)
      LEFT JOIN unread_counts uc ON uc.sender_id = u.id
      ORDER BY lm.sent_at DESC
    `;

    const result = await db.query(query, [adminId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('getAllConversations error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminId = async (req, res) => {
  try {
    const result = await db.query(`SELECT id FROM users WHERE role = 'admin' LIMIT 1`);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No admin found' });
    }
    res.json({ adminId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const cancelBookingAdmin = async (
  req,
  res
) => {
  try {
    const booking =
      await bookingService.cancelBookingByAdmin(
        req.params.id
      );

    res.json(booking);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Lỗi server",
    });
  }
};