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
};

export default authApi;