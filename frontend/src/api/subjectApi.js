import axiosClient from "./axiosClient";

export const subjectApi = {
  getAll: () => axiosClient.get("/subjects"),
  getById: (id) => axiosClient.get(`/subjects/${id}`),
};
