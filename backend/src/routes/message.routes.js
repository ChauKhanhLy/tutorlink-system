import express from 'express'
import {
  getAllMessages,
  getConversations,
  getMessagesBetweenUsers,
  createMessage
} from '../controllers/message.controller.js'

const router = express.Router()

router.get('/', getAllMessages)
// router.get('/:user1/:user2', getMessagesBetweenUsers)
router.get('/conversations/:userId', getConversations)
router.get('/:user1/:user2', getMessagesBetweenUsers)
router.post('/', createMessage)

export default router
