import axiosClient from "./axiosClient";

export const billingApi = {
  // Lấy ví tiền
  getWallet: () => {
    return axiosClient.get("/wallet");
  },

  // Lịch sử giao dịch
  getTransactions: () => {
    return axiosClient.get("/transactions");
  },

  // Nạp tiền
  deposit: (amount) => {
    return axiosClient.post("/wallet/deposit", { amount });
  },
};