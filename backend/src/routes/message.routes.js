import express from 'express'
import authMiddleware from '../middlewares/auth.middleware.js'
import {
  getAllMessages,
  getConversations,
  getMessagesBetweenUsers,
  createMessage,
  getOrCreateSupportConversation
} from '../controllers/message.controller.js'

const router = express.Router()

router.get('/', getAllMessages)
// router.get('/:user1/:user2', getMessagesBetweenUsers)
router.get('/conversations/:userId', getConversations)
router.get('/:user1/:user2', getMessagesBetweenUsers)
router.post('/', createMessage)
router.post('/conversations/support', authMiddleware, getOrCreateSupportConversation);

export default router
