import axiosClient from "./axiosClient";

const adminApi = {
  getStats: () => axiosClient.get("/admin/stats"),
  getPendingTutors: () => axiosClient.get("/admin/tutors/pending"),
  approveTutor: (id) => axiosClient.post(`/admin/verify-tutor/${id}`),
  rejectTutor: (id, reason) => axiosClient.post(`/admin/reject-tutor/${id}`, { reason }),
  getUsers: () => axiosClient.get("/admin/users"),
  updateUserStatus: (id, data) => axiosClient.patch(`/admin/users/${id}`, data),
};

export default adminApi;