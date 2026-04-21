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
  getAdminId: () => axiosClient.get("/admin/id"),

  // 👇 THÊM 2 HÀM NÀY
  getAllConversations: () => axiosClient.get("/admin/conversations"),

  getOrCreateSupportConversation: (userId) =>
    axiosClient.post("/conversations/support", { userId }),
};

export default messageApi;
