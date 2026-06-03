import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const Message = {
  findAll: jest.fn(),
  create: jest.fn(),
}

const db = {
  query: jest.fn(),
}

jest.unstable_mockModule('../src/models/message.model.js', () => ({ default: Message }))
jest.unstable_mockModule('../src/config/db.js', () => ({ default: db }))
jest.unstable_mockModule('uuid', () => ({ v4: jest.fn(() => 'mock-uuid') }))
jest.unstable_mockModule('sequelize', () => ({
  Op: {
    or: Symbol('or'),
  },
}))

const messageController = await import('../src/controllers/message.controller.js')

const createResponse = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
    send: jest.fn(),
  }
  res.status.mockReturnValue(res)
  return res
}

describe('Message Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllMessages', () => {
    it('should return messages', async () => {
      Message.findAll.mockResolvedValue([{ id: 1 }])

      const res = createResponse()

      await messageController.getAllMessages({}, res)

      expect(res.status).toHaveBeenCalledWith(200)
    })
  })

  describe('getConversations', () => {
    it('should return conversations', async () => {
      db.query.mockResolvedValue({ rows: [{ id: 1 }] })

      const req = {
        params: { userId: '10' },
      }
      const res = createResponse()

      await messageController.getConversations(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith([{ id: 1 }])
    })
  })

  describe('getMessagesBetweenUsers', () => {
    it('should return messages between users', async () => {
      Message.findAll.mockResolvedValue([{ id: 1 }])

      const req = {
        params: { user1: '1', user2: '2' },
      }
      const res = createResponse()

      await messageController.getMessagesBetweenUsers(req, res)

      expect(Message.findAll).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
    })
  })

  describe('createMessage', () => {
    it('should create message', async () => {
      Message.create.mockResolvedValue({ id: 'mock-uuid' })

      const req = {
        body: {
          sender_id: 1,
          receiver_id: 2,
          content: 'hello',
        },
      }
      const res = createResponse()

      await messageController.createMessage(req, res)

      expect(Message.create).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(201)
    })

    it('should return 400 when missing data', async () => {
      const req = { body: {} }
      const res = createResponse()

      await messageController.createMessage(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })
  })

  describe('getOrCreateSupportConversation', () => {
    beforeEach(() => {
      process.env.ADMIN_ID = '999'
    })

    it('should return admin conversation', async () => {
      const req = {
        body: { userId: 1 },
      }
      const res = createResponse()

      await messageController.getOrCreateSupportConversation(req, res)

      expect(res.json).toHaveBeenCalledWith({ id: '999' })
    })
  })
})