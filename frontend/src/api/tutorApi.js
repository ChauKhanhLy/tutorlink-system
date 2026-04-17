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

  getById: async (id) => {
    const res = await axiosClient.get("/matching");
    const tutors = res.data?.tutors || [];
    const tutor = tutors.find((item) => String(item.id) === String(id));

    if (!tutor) {
      throw new Error("Tutor not found");
    }

    return { data: tutor };
  },

  getAvailability: async () => {
    return { data: { availableSlots: [] } };
  },
};