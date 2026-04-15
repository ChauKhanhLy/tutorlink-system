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
