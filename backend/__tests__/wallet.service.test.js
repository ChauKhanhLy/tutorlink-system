import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const walletModel = {
  findOne: jest.fn(),
  create: jest.fn(),
}

const transactionModel = {
  create: jest.fn(),
  findAndCountAll: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
}

const settlementModel = {
  create: jest.fn(),
  findAll: jest.fn(),
}

const sequelize = {
  transaction: jest.fn(() => ({
    commit: jest.fn(),
    rollback: jest.fn(),
  })),
}

jest.unstable_mockModule('../src/models/wallet.model.js', () => ({ default: walletModel }))
jest.unstable_mockModule('../src/models/transaction.model.js', () => ({ default: transactionModel }))
jest.unstable_mockModule('../src/models/settlement.model.js', () => ({ default: settlementModel }))
jest.unstable_mockModule('../src/config/database.js', () => ({ default: sequelize }))

const walletService = await import('../src/services/wallet.service.js')

describe('wallet service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getOrCreateWallet', () => {
    it('creates a new wallet if none exists', async () => {
      walletModel.findOne.mockResolvedValue(null)
      walletModel.create.mockResolvedValue({ user_id: 'user-1', balance: 0 })

      const res = await walletService.getOrCreateWallet('user-1')

      expect(walletModel.findOne).toHaveBeenCalledWith({ where: { user_id: 'user-1' } })
      expect(walletModel.create).toHaveBeenCalledWith({
        user_id: 'user-1',
        balance: 0,
        frozen_balance: 0,
        total_deposited: 0,
        total_spent: 0,
      })
      expect(res.balance).toBe(0)
    })

    it('returns existing wallet if it exists', async () => {
      const existing = { user_id: 'user-1', balance: 50000 }
      walletModel.findOne.mockResolvedValue(existing)

      const res = await walletService.getOrCreateWallet('user-1')

      expect(walletModel.create).not.toHaveBeenCalled()
      expect(res).toEqual(existing)
    })
  })

  describe('depositToWallet', () => {
    it('deposits to wallet and creates transaction record', async () => {
      const mockWalletUpdate = jest.fn()
      walletModel.findOne.mockResolvedValue({
        id: 'wallet-1',
        balance: 10000,
        total_deposited: 10000,
        update: mockWalletUpdate,
      })

      const res = await walletService.depositToWallet('user-1', 20000)

      expect(mockWalletUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          balance: 30000,
          total_deposited: 30000,
        }),
        expect.any(Object)
      )
      expect(transactionModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-1',
          type: 'deposit',
          amount: 20000,
        }),
        expect.any(Object)
      )
    })
  })
})
