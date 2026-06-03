import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const favoriteDal = {
  addFavorite: jest.fn(),
  removeFavorite: jest.fn(),
  getFavoritesByStudent: jest.fn(),
}

jest.unstable_mockModule('../src/dal/favorite.dal.js', () => favoriteDal)

const favoriteController = await import('../src/controllers/favorite.controller.js')

const createResponse = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  }
  res.status.mockReturnValue(res)
  return res
}

describe('Favorite Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('add favorite success', async () => {
    favoriteDal.addFavorite.mockResolvedValue({ id: 1 })

    const req = {
      user: { id: 1, role: 'learner' },
      body: { tutorId: 2 },
    }
    const res = createResponse()

    await favoriteController.addFavorite(req, res)

    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('should reject non learner', async () => {
    const req = {
      user: { id: 1, role: 'tutor' },
      body: { tutorId: 2 },
    }
    const res = createResponse()

    await favoriteController.addFavorite(req, res)

    expect(res.status).toHaveBeenCalledWith(403)
  })

  it('remove favorite success', async () => {
    favoriteDal.removeFavorite.mockResolvedValue(true)

    const req = {
      user: { id: 1 },
      params: { tutorId: 2 },
    }
    const res = createResponse()

    await favoriteController.removeFavorite(req, res)

    expect(res.json).toHaveBeenCalledWith({ success: true })
  })

  it('get favorites success', async () => {
    favoriteDal.getFavoritesByStudent.mockResolvedValue([])

    const req = {
      user: { id: 1, role: 'learner' },
    }
    const res = createResponse()

    await favoriteController.getMyFavorites(req, res)

    expect(res.json).toHaveBeenCalled()
  })
})