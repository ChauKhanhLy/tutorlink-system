/*import axiosClient from "./axiosClient";

export const tutorApi = {
  getAll: () => axiosClient.get("/tutors"),

  getById: (id) => axiosClient.get(`/tutors/${id}`),

  search: (params) => axiosClient.get("/matching", { params }), // ✅ FIX
};
import axiosClient from "./axiosClient";

export const tutorApi = {
  getAll: () => axiosClient.get("/tutors"),

  getById: (id) => axiosClient.get(`/tutors/${id}`),

  search: (params) => axiosClient.get("/tutors", { params }), 
  // ví dụ: ?q=toan&subject=Toán
};*/
import axiosClient from "./axiosClient";

export const tutorApi = {
  getAll: () => axiosClient.get("/matching"),
  search: (params) => axiosClient.get("/matching", { params }),

  getById: (id) => axiosClient.get(`/tutors/${id}`),

  getAvailability: (id) => axiosClient.get(`/tutors/${id}/availability`),

  getTutorStats: () => axiosClient.get("/tutors/stats"),

  getMyAvailabilityPreferences: () => axiosClient.get("/tutors/me/availability-preferences"),
  updateMyAvailability: (schedule) => axiosClient.put("/tutors/me/availability", { schedule }),

  registerTutor: (data) => axiosClient.post("/users/become-tutor", data),
};