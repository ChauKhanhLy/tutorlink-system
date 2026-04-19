//import pool from '../../config/database.js';
/*import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import Message from '../models/message.model.js';

export const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.findAll({
      order: [['sent_at', 'ASC']],
    });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMessagesBetweenUsers = async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: user1, receiver_id: user2 },
          { sender_id: user2, receiver_id: user1 },
        ],
      },
      order: [['sent_at', 'ASC']],
    });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createMessage = async (req, res) => {
  try {
    const { sender_id, receiver_id, content } = req.body;

    if (!sender_id || !receiver_id || !content) {
      return res.status(400).json({
        error: 'Thiếu sender_id, receiver_id hoặc content',
      });
    }

    const message = await Message.create({
      id: uuidv4(),
      sender_id,
      receiver_id,
      content,
      sent_at: new Date(),
      is_read: false,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};*/
import { v4 as uuidv4 } from 'uuid'
import { Op } from 'sequelize'
import Message from '../models/message.model.js'
import db from '../config/db.js'

export const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.findAll({
      order: [['sent_at', 'ASC']],
    })

    res.status(200).json(messages)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getConversations = async (req, res) => {
  try {
    const { userId } = req.params;

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
        u.role,
        (SELECT name FROM subjects s 
         JOIN tutor_subjects ts ON s.id = ts.subject_id 
         WHERE ts.tutor_id = u.id LIMIT 1) as "subject"
      FROM last_messages lm
      JOIN users u ON u.id = (CASE WHEN lm.sender_id = $1 THEN lm.receiver_id ELSE lm.sender_id END)
      LEFT JOIN unread_counts uc ON uc.sender_id = u.id
      ORDER BY lm.sent_at DESC
    `;

    const result = await db.query(query, [userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Lỗi getConversations:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getMessagesBetweenUsers = async (req, res) => {
  try {
    const { user1, user2 } = req.params

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: user1, receiver_id: user2 },
          { sender_id: user2, receiver_id: user1 },
        ],
      },
      order: [['sent_at', 'ASC']],
    })

    res.status(200).json(messages)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const createMessage = async (req, res) => {
  try {
    const { sender_id, receiver_id, content } = req.body

    if (!sender_id || !receiver_id || !content) {
      return res.status(400).json({
        error: 'Thiếu sender_id, receiver_id hoặc content',
      })
    }

    const message = await Message.create({
      id: uuidv4(),
      sender_id,
      receiver_id,
      content,
      sent_at: new Date(),
      is_read: false,
    })

    res.status(201).json(message)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getOrCreateSupportConversation = async (req, res) => {
  try {
    const { userId } = req.body;
    const adminId = process.env.ADMIN_ID;

    if (!userId || !adminId) {
      return res.status(400).json({ error: 'Thiếu thông tin' });
    }

    // Conversation không có bảng riêng, chỉ cần trả về adminId
    // Vì hệ thống dùng trực tiếp sender_id và receiver_id trong messages
    res.json({ id: adminId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};