import axiosClient from "./axiosClient";

const authApi = {
  login: (data) => {
    return axiosClient.post("/auth/login", data);
  },

  registerLearner: (data) => {
    return axiosClient.post("/auth/register/learner", data);
  },

  registerTutor: (data) => {
    return axiosClient.post("/auth/register/tutor", data);
  },
  verifyOTP: (data) =>
  axiosClient.post(
    "/auth/verify-otp",
    data
  ),
  resendOTP: (data) =>
  axiosClient.post(
    "/auth/resend-otp",
    data
  ),
  forgotPassword: (data) =>
  axiosClient.post(
    "/auth/forgot-password",
    data
  ),
  resetPassword: (data) =>
  axiosClient.post(
      "/auth/reset-password",
      data
  ),
};

export default authApi;