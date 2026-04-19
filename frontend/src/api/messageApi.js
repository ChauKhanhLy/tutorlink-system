import axiosClient from "./axiosClient";

const messageApi = {
  // getConversations: () => {
  //   return axiosClient.get("/conversations");
  // },
  getConversations: (userId) => {
    return axiosClient.get(`/messages/conversations/${userId}`);
  },

  getMessages: (userId, otherId) => {
    return axiosClient.get(`/messages/${userId}/${otherId}`);
  },
};

export default messageApi;