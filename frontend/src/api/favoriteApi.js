import axiosClient from "./axiosClient";

export const favoriteApi = {
  // Lấy danh sách gia sư đã lưu
  getMyFavorites: () => {
    return axiosClient.get("/favorites");
  },

  // Thêm vào yêu thích
  addFavorite: (tutorId) => {
    return axiosClient.post("/favorites", { tutorId });
  },

  // Xóa khỏi yêu thích
  removeFavorite: (tutorId) => {
    return axiosClient.delete(`/favorites/${tutorId}`);
  },
};