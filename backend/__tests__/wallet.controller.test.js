import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const walletService = {
  getOrCreateWallet: jest.fn(),
  getWalletTransactions: jest.fn(),
  getWeeklySettlements: jest.fn(),
  processWeeklySettlements: jest.fn(),
  depositToWallet: jest.fn(),
}

jest.unstable_mockModule('../src/services/wallet.service.js', () => walletService)
jest.unstable_mockModule('../src/config/database.js', () => ({ default: {} }))
jest.unstable_mockModule('../src/socket/chat.socket.js', () => ({ getOnlineUserSocket: jest.fn() }))

const walletController = await import('../src/controllers/wallet.controller.js')

const createResponse = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  }
  res.status.mockReturnValue(res)
  return res
}

describe('wallet controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getWallet', () => {
    it('returns 401 when unauthorized', async () => {
      const req = {}
      const res = createResponse()

      await walletController.getWallet(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
    })

    it('returns wallet when authorized', async () => {
      const req = { user: { id: 'user-1' } }
      const res = createResponse()
      walletService.getOrCreateWallet.mockResolvedValue({ balance: '100000' })

      await walletController.getWallet(req, res)

      expect(walletService.getOrCreateWallet).toHaveBeenCalledWith('user-1')
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { balance: '100000' } })
    })
  })

  describe('depositFunds', () => {
    it('returns 400 when amount is below 10,000 VND', async () => {
      const req = { user: { id: 'user-1' }, body: { amount: 5000 } }
      const res = createResponse()

      await walletController.depositFunds(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })
  })
})
