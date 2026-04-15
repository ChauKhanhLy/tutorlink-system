import axiosClient from "./axiosClient";

export const bookingApi = {
  create: (data) => axiosClient.post("/bookings", data),

  getMyBookings: () => axiosClient.get("/bookings/me"),
};