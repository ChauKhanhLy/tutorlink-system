import axiosClient from "./axiosClient";

export const complaintApi = {
  create: (data) => axiosClient.post('/complaints', data),
  getMyComplaints: () => axiosClient.get('/complaints/my'),
  adminGetAll: (params) => axiosClient.get('/complaints/admin/all', { params }),
  adminUpdate: (id, data) => axiosClient.put(`/complaints/admin/${id}`, data),
  getAll: (params) => axiosClient.get('/complaints/admin/all', { params }),
  updateStatus: (id, data) => axiosClient.put(`/complaints/admin/${id}`, data),
};
