import axiosClient from "./axiosClient";

const messageApi = {
  getConversations: () => {
    return axiosClient.get("/conversations");
  },

  getMessages: (userId, otherId) => {
    return axiosClient.get(`/messages/${userId}/${otherId}`);
  },
};

export default messageApi;