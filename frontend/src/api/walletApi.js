import axiosClient from "./axiosClient";

export const walletApi = {
  // Lấy thông tin wallet
  getWallet: () => axiosClient.get("/wallet"),
  
  // Nạp tiền vào wallet
  deposit: (amount, paymentMethod) => 
    axiosClient.post("/wallet/deposit", { 
      amount, 
      payment_method: paymentMethod 
    }),
    
  // Lấy lịch sử giao dịch
  getTransactions: (page = 1, limit = 20) => 
    axiosClient.get("/wallet/transactions", { 
      params: { page, limit } 
    }),
    
  // Lấy settlements hàng tuần
  getSettlements: () => 
    axiosClient.get("/wallet/settlements"),
    
  // Lấy thống kê wallet
  getStats: () => 
    axiosClient.get("/wallet/stats"),
    
  // Admin: Xử lý settlements
  processSettlements: () => 
    axiosClient.post("/wallet/process-settlements"),
};
