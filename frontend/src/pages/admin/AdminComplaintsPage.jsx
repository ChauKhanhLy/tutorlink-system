import React from "react";
import { Navigate } from "react-router-dom";
import { Flag, CheckCircle, XCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { complaintApi } from "../../api/complantApi";

export function AdminComplaintsPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState(null);
  const [resolutionNote, setResolutionNote] = React.useState("");

  React.useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await complaintApi.getAll();
      setComplaints(res.data.data || []);
    } catch (err) {
      toast.error("Không tải được khiếu nại");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await complaintApi.updateStatus(id, { status, resolution_note: resolutionNote });
      toast.success("Đã cập nhật");
      fetchComplaints();
      setSelected(null);
      setResolutionNote("");
    } catch (err) {
      toast.error("Cập nhật thất bại");
    }
  };

  if (user?.role !== "admin") return <Navigate to="/admin/login" replace />;

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Flag className="h-8 w-8 text-red-600" />
        <h1 className="text-2xl font-bold">Quản lý khiếu nại</h1>
      </div>
      {loading ? <div>Đang tải...</div> : (
        <div className="space-y-4">
          {complaints.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border p-5">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-bold">{c.title}</h3>
                  <p className="text-sm text-slate-500">Từ: {c.reporter_name} | Tới: {c.reported_name || '?'}</p>
                  <p className="mt-2">{c.description}</p>
                  {c.evidence && <a href={c.evidence} target="_blank" className="text-indigo-600 text-sm">Xem bằng chứng</a>}
                </div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    c.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    c.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {c.status === 'pending' ? 'Chờ xử lý' : c.status === 'resolved' ? 'Đã giải quyết' : 'Từ chối'}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelected(c)} className="mt-3 text-indigo-600 text-sm flex items-center gap-1"><Eye size={14}/> Xử lý</button>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold mb-4">Xử lý khiếu nại</h3>
            <p><strong>Tiêu đề:</strong> {selected.title}</p>
            <p><strong>Mô tả:</strong> {selected.description}</p>
            <textarea className="w-full mt-4 p-2 border rounded-xl" rows="3" placeholder="Ghi chú giải quyết..." value={resolutionNote} onChange={e => setResolutionNote(e.target.value)} />
            <div className="flex gap-3 mt-4">
              <button onClick={() => updateStatus(selected.id, 'resolved')} className="flex-1 py-2 bg-green-600 text-white rounded-xl">Đã giải quyết</button>
              <button onClick={() => updateStatus(selected.id, 'rejected')} className="flex-1 py-2 bg-red-600 text-white rounded-xl">Từ chối</button>
              <button onClick={() => setSelected(null)} className="flex-1 py-2 border rounded-xl">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}