import axiosClient from "./axiosClient";

export const videoRoomApi = {
  // Lấy toàn bộ phòng (admin)
  getAllRooms: () => axiosClient.get("/video-rooms"),

  // Lấy thông tin phòng theo ID (UUID của video session)
  getRoom: (id) => axiosClient.get(`/video-rooms/${id}`),
  
  // Lấy thông tin phòng theo booking ID
  getRoomByBookingId: (bookingId) => axiosClient.get(`/video-rooms/booking/${bookingId}`),
  
  // Tạo phòng mới (nếu cần thủ công)
  createRoom: (data) => axiosClient.post("/video-rooms", data),
  
  // Cập nhật trạng thái phòng (ongoing, ended)
  updateStatus: (id, status) => axiosClient.patch(`/video-rooms/${id}/status`, { status }),
  
  // Join room (để cập nhật trạng thái ongoing)
  joinRoom: (id) => axiosClient.get(`/video-rooms/${id}/join`),
};