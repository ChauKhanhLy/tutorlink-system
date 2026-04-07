//import pool from '../../config/database.js';
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