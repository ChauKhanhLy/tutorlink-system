import axiosClient from "./axiosClient";

const adminApi = {
  getStats: () => axiosClient.get("/admin/stats"),
  getPendingTutors: () => axiosClient.get("/admin/tutors/pending"),
  approveTutor: (id) => axiosClient.post(`/admin/verify-tutor/${id}`),
  rejectTutor: (id, reason) => axiosClient.post(`/admin/reject-tutor/${id}`, { reason }),
};

export default adminApi;