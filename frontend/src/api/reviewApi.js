import axiosClient from "./axiosClient";

export const reviewApi = {
  getByTutor: (tutorId) =>
    axiosClient.get(`/reviews?tutorId=${tutorId}`),

  create: (data) =>
    axiosClient.post("/reviews", data),
};