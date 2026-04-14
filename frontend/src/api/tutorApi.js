import axiosClient from "./axiosClient";

export const tutorApi = {
  getAll: () => axiosClient.get("/tutors"),

  getById: (id) => axiosClient.get(`/tutors/${id}`),

  search: (params) => axiosClient.get("/tutors", { params }), 
  // ví dụ: ?q=toan&subject=Toán
};