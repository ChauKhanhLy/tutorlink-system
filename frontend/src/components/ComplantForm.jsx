import React from "react";
import { AlertTriangle, Send, X } from "lucide-react";
import { toast } from "sonner";
import { complaintApi } from "../api/complantApi";

export function ComplaintForm({ onClose, bookingId, reportedUserId, reportedName }) {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    reported_id: reportedUserId || "",
    booking_id: bookingId || "",
    type: "other",
    title: "",
    description: "",
    evidence: "",
  });

  const complaintTypes = [
    { value: "late", label: "Gia sư vào muộn / không báo trước" },
    { value: "misconduct", label: "Hành vi không chuẩn mực (ăn nói, thái độ)" },
    { value: "payment", label: "Vấn đề về thanh toán / tiền nong" },
    { value: "communication", label: "Giao tiếp kém, không rõ ràng" },
    { value: "other", label: "Vấn đề khác" },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error("Vui lòng nhập tiêu đề");
    if (!formData.description.trim()) return toast.error("Vui lòng nhập mô tả chi tiết");
    setLoading(true);
    try {
      await complaintApi.create(formData);
      toast.success("Đã gửi khiếu nại. Admin sẽ xem xét.");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gửi thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-xl font-bold">Gửi khiếu nại</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {reportedName && (
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-sm">Người bị khiếu nại: <strong>{reportedName}</strong></p>
            </div>
          )}
          <div>
            <label className="block text-sm font-bold mb-2">Loại khiếu nại *</label>
            <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 bg-slate-50 border rounded-xl" required>
              {complaintTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Tiêu đề *</label>
            <input name="title" value={formData.title} onChange={handleChange} className="w-full p-2 bg-slate-50 border rounded-xl" required />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Mô tả *</label>
            <textarea name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full p-2 bg-slate-50 border rounded-xl" required />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Bằng chứng (link)</label>
            <input name="evidence" value={formData.evidence} onChange={handleChange} placeholder="https://..." className="w-full p-2 bg-slate-50 border rounded-xl" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border rounded-xl">Hủy</button>
            <button type="submit" disabled={loading} className="flex-1 py-2 bg-red-600 text-white rounded-xl flex items-center justify-center gap-2">
              {loading ? "Đang gửi..." : <><Send size={16}/> Gửi</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}