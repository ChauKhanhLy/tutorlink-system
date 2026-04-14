import express from 'express';
import { getAllMessages, getMessagesBetweenUsers, createMessage } from '../controller/message.js';

const router = express.Router();

router.get('/', getAllMessages);
router.get('/:user1/:user2', getMessagesBetweenUsers);
router.post('/', createMessage);

export default router;