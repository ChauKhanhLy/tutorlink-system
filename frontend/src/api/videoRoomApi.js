import axiosClient from "./axiosClient";

export const videoRoomApi = {
  // Lấy thông tin phòng theo ID (room_id hoặc booking_id)
  getRoom: (id) => axiosClient.get(`/video-rooms/${id}`),
  
  // Tạo phòng mới (thường gọi khi đặt lịch)
  createRoom: (data) => axiosClient.post("/video-rooms", data),
  
  // Cập nhật trạng thái phòng (ongoing, ended)
  updateStatus: (id, status) => axiosClient.patch(`/video-rooms/${id}/status`, { status }),
  
  // Lấy token để join (nếu dùng dịch vụ bên thứ ba)
  getToken: (roomId) => axiosClient.post(`/video-rooms/${roomId}/token`),
};