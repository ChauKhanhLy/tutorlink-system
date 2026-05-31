import * as favoriteDal from '../dal/favorite.dal.js';

export const addFavorite = async (req, res) => {
    try {
        const studentId = req.user.id; // từ middleware auth
        const { tutorId } = req.body;
        if (!tutorId) {
            return res.status(400).json({ message: 'Thiếu tutorId' });
        }
        // Kiểm tra role phải là learner
        if (req.user.role !== 'learner') {
            return res.status(403).json({ message: 'Chỉ học viên mới được lưu gia sư' });
        }
        const favorite = await favoriteDal.addFavorite(studentId, tutorId);
        res.status(201).json({ success: true, favorite });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

export const removeFavorite = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { tutorId } = req.params;
        const removed = await favoriteDal.removeFavorite(studentId, tutorId);
        if (!removed) {
            return res.status(404).json({ message: 'Không tìm thấy' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

export const getMyFavorites = async (req, res) => {
    try {
        const studentId = req.user.id;
        if (req.user.role !== 'learner') {
            return res.status(403).json({ message: 'Chỉ học viên mới có danh sách yêu thích' });
        }
        const favorites = await favoriteDal.getFavoritesByStudent(studentId);
        res.json({ success: true, data: favorites });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};