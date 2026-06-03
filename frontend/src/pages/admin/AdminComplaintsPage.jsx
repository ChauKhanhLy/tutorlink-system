import React from "react";
import { Navigate } from "react-router-dom";
import { Flag, Eye } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { complaintApi } from "../../api/complantApi"; // ← sửa chính tả

export function AdminComplaintsPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState(null);
  const [resolutionNote, setResolutionNote] = React.useState("");

    React.useEffect(() => {
      if (
        ["admin", "support_staff"].includes(
          user?.role
        )
      ) {
        fetchComplaints();
      }
    }, [user?.role]);  

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

  // Helper: xác định loại file từ URL để preview
  const getMediaType = (url) => {
    if (!url) return null;
    const ext = url.split('.').pop().toLowerCase();
    if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) return 'video';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    return 'link';
  };

  if (
  !["admin", "support_staff"].includes(
    user?.role
  )
) {
  return (
    <Navigate
      to="/admin/login"
      replace
    />
  );
}

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Flag className="h-8 w-8 text-red-600" />
        <h1 className="text-2xl font-bold">Quản lý khiếu nại</h1>
      </div>

      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <div className="space-y-4">
                  {complaints.length === 0 && (
              <div className="bg-white rounded-2xl border p-8 text-center text-slate-500">
                Không có khiếu nại nào
              </div>
            )} 
          {complaints.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border p-5">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-bold">{c.title}</h3>
                  <p className="text-sm text-slate-500">
                    Từ: {c.reporter_name} | Tới: {c.reported_name || "?"}
                  </p>
                  <p className="mt-2">{c.description}</p>
                  {c.evidence && (
                    <div className="mt-2">
                      <span className="text-xs text-slate-400">Bằng chứng: </span>
                      <a
                        href={c.evidence}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 text-sm hover:underline"
                      >
                        Xem bằng chứng
                      </a>
                    </div>
                  )}
                </div>
                <div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      c.status === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : c.status === "resolved"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {c.status === "pending"
                      ? "Chờ xử lý"
                      : c.status === "resolved"
                      ? "Đã giải quyết"
                      : "Từ chối"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelected(c)}
                className="mt-3 text-indigo-600 text-sm flex items-center gap-1"
              >
                <Eye size={14} /> Xử lý
              </button>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-slate-800 border-b pb-2">
              Xử lý khiếu nại
            </h3>
            <div className="space-y-3 text-slate-700">
              <p><strong>Tiêu đề:</strong> {selected.title}</p>
              <p><strong>Mô tả:</strong> {selected.description}</p>
              
              {/* Bằng chứng người dùng gửi (preview) */}
              {selected.evidence && (
                <div>
                  <p className="font-semibold">Bằng chứng đính kèm:</p>
                  {getMediaType(selected.evidence) === 'video' && (
                    <video src={selected.evidence} controls className="mt-2 w-full rounded-lg border max-h-64" />
                  )}
                  {getMediaType(selected.evidence) === 'image' && (
                    <img src={selected.evidence} alt="Evidence" className="mt-2 max-w-full rounded-lg border max-h-64 object-contain" />
                  )}
                  {getMediaType(selected.evidence) === 'link' && (
                    <a href={selected.evidence} target="_blank" rel="noreferrer" className="text-indigo-600 underline break-all">
                      {selected.evidence}
                    </a>
                  )}
                </div>
              )}

              {/* Video ghi hình buổi học từ hệ thống */}
              {selected.video_record_url ? (
                <div className="mt-4">
                  <p className="font-semibold text-slate-700">Video ghi hình buổi học:</p>
                  <video
                    src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || "http://localhost:3000"}${selected.video_record_url}`}
                    controls
                    className="w-full rounded-2xl border aspect-video object-contain bg-slate-950 shadow-inner mt-2"
                  />
                </div>
              ) : (
                <div className="mt-4 p-3 bg-slate-100 rounded-xl text-slate-500 text-sm">
                  ⚠️ Không có video ghi hình cho buổi học này.
                </div>
              )}
            </div>

            <textarea
              className="w-full mt-4 p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
              rows="3"
              placeholder="Nhập ghi chú giải quyết tại đây..."
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => updateStatus(selected.id, "resolved")}
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition"
              >
                Đã giải quyết
              </button>
              <button
                onClick={() => updateStatus(selected.id, "rejected")}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition"
              >
                Từ chối
              </button>
              <button
                onClick={() => setSelected(null)}
                className="flex-1 py-2 border hover:bg-slate-50 rounded-xl transition text-slate-600"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}