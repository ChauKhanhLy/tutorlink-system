import express from 'express';
import { getMessagesBetweenUsers } from '../controller/message.js';

const router = express.Router();

router.get('/:user1/:user2', getMessagesBetweenUsers);

export default router;