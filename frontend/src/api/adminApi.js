import axiosClient from "./axiosClient";

const adminApi = {
  getStats: () => axiosClient.get("/admin/stats"),
  getPendingTutors: () => axiosClient.get("/admin/pending-tutors"),
  approveTutor: (id) => axiosClient.put(`/admin/tutors/${id}/approve`),
  rejectTutor: (id, reason) => axiosClient.put(`/admin/tutors/${id}/reject`, { reason }),
};

export default adminApi;