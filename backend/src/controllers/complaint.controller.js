import * as complaintService from '../services/complaint.service.js';

export const createComplaint = async (req, res) => {
  try {
    const userId = req.user.id;
    const complaint = await complaintService.createComplaint(userId, req.body);
    res.json({ success: true, data: complaint });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await complaintService.getMyComplaints(req.user.id);
    res.json({ success: true, data: complaints });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const adminGetAllComplaints = async (req, res) => {
  try {
    const { status } = req.query;
    const complaints = await complaintService.getAllComplaints({ status });
    res.json({ success: true, data: complaints });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const adminUpdateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution_note } = req.body;
    const updated = await complaintService.updateComplaintStatus(id, status, resolution_note);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};