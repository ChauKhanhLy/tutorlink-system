import axiosClient from "./axiosClient";

const userApi = {
  getAll: () => {
    return axiosClient.get("/users");
  },

  getById: (id) => {
    return axiosClient.get(`/users/${id}`);
  },

  create: (data) => {
    return axiosClient.post("/users", data);
  },
};

export default userApi;