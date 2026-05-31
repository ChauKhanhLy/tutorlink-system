import * as complaintDAL from '../dal/complaint.dal.js';

export const createComplaint = async (userId, data) => {
  if (!data.reported_id) throw new Error('Thiếu thông tin người bị khiếu nại');
  if (!data.title || !data.description) throw new Error('Vui lòng nhập đầy đủ tiêu đề và mô tả');
  if (userId === data.reported_id) throw new Error('Không thể khiếu nại chính mình');

  const complaint = await complaintDAL.createComplaint({
    reporter_id: userId,
    reported_id: data.reported_id,
    booking_id: data.booking_id || null,
    type: data.type,
    title: data.title,
    description: data.description,
    evidence: data.evidence || null,
  });
  return complaint;
};

export const getMyComplaints = async (userId) => {
  return await complaintDAL.getComplaintsByReporter(userId);
};

export const getAllComplaints = async (filters) => {
  return await complaintDAL.getAllComplaints(filters);
};

export const updateComplaintStatus = async (complaintId, status, resolution_note, adminId) => {
  if (!['pending', 'resolved', 'rejected'].includes(status)) {
    throw new Error('Trạng thái không hợp lệ');
  }
  return await complaintDAL.updateComplaintStatus(complaintId, status, resolution_note);
};