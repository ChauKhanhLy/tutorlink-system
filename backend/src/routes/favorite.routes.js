import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import * as favoriteController from '../controllers/favorite.controller.js';

const router = express.Router();

// Tất cả routes đều cần xác thực
router.use(authMiddleware);

router.get('/', favoriteController.getMyFavorites);
router.post('/', favoriteController.addFavorite);
router.delete('/:tutorId', favoriteController.removeFavorite);

export default router;