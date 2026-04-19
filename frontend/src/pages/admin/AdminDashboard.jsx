import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  BookOpen,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  LogOut,
  LayoutDashboard,
  UserPlus,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import adminApi from "../../api/adminApi";
import { ImageWithFallback } from "../../components/Image/ImageWithFallback";

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = React.useState("pending");
  const [stats, setStats] = React.useState(null);
  const [pendingTutors, setPendingTutors] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedTutor, setSelectedTutor] = React.useState(null);
  const [rejectReason, setRejectReason] = React.useState("");

  const sidebarItems = [
    { id: "dashboard", name: "Tổng quan", icon: LayoutDashboard },
    { id: "pending", name: "Duyệt gia sư", icon: UserPlus, badge: pendingTutors.length },
  ];

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, pendingRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getPendingTutors(),
      ]);
      setStats(statsRes.data.data);
      setPendingTutors(pendingRes.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminApi.approveTutor(id);
      toast.success("Đã duyệt gia sư thành công!");
      fetchData();
      setSelectedTutor(null);
    } catch (err) {
        console.error(err);
        
      toast.error("Lỗi khi duyệt gia sư");
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }
    try {
      await adminApi.rejectTutor(id, rejectReason);
      toast.success("Đã từ chối đăng ký");
      fetchData();
      setSelectedTutor(null);
      setRejectReason("");
    } catch (err) {
        console.error(err);
      toast.error("Lỗi khi từ chối");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );

  /*if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Bạn không có quyền truy cập</p>
      </div>
    );
  }*/

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-slate-900 flex items-center">
            <Shield className="h-6 w-6 text-indigo-600 mr-2" />
            TutorLink Admin
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all ${
                activeTab === item.id
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </div>
              {item.badge > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === item.id
                    ? "bg-white text-indigo-600"
                    : "bg-indigo-600 text-white"
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="font-bold text-indigo-600">
                {user?.name?.charAt(0) || "A"}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Tổng quan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={Users}
                  label="Tổng học viên"
                  value={stats?.total_learners || 0}
                  color="bg-blue-50 text-blue-600"
                />
                <StatCard
                  icon={UserCheck}
                  label="Gia sư đã duyệt"
                  value={stats?.total_tutors || 0}
                  color="bg-green-50 text-green-600"
                />
                <StatCard
                  icon={BookOpen}
                  label="Tổng buổi học"
                  value={stats?.total_bookings || 0}
                  color="bg-purple-50 text-purple-600"
                />
                <StatCard
                  icon={DollarSign}
                  label="Doanh thu"
                  value={`$${stats?.total_revenue || 0}`}
                  color="bg-amber-50 text-amber-600"
                />
              </div>
            </div>
          )}

          {activeTab === "pending" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Duyệt đăng ký gia sư ({pendingTutors.length})
              </h2>

              <div className="space-y-4">
                {pendingTutors.map((tutor) => (
                  <div
                    key={tutor.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6"
                  >
                    <div className="flex items-start gap-4">
                      <ImageWithFallback
                        src={tutor.avatar}
                        alt={tutor.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-slate-900 text-lg">
                              {tutor.name}
                            </h3>
                            <p className="text-slate-500 text-sm">{tutor.email}</p>
                            <p className="text-slate-500 text-sm">{tutor.phone}</p>
                          </div>
                          <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold">
                            Chờ duyệt
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Học vấn:</span>
                            <p className="font-medium">{tutor.education || "Chưa cập nhật"}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Kinh nghiệm:</span>
                            <p className="font-medium">{tutor.experience || "Chưa cập nhật"}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-500">Giới thiệu:</span>
                            <p className="font-medium">{tutor.bio || "Chưa cập nhật"}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Giá mỗi giờ:</span>
                            <p className="font-medium text-indigo-600">${tutor.hourly_fee}</p>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-3">
                          <button
                            onClick={() => setSelectedTutor(tutor)}
                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" /> Xem chi tiết
                          </button>
                          <button
                            onClick={() => handleApprove(tutor.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all flex items-center gap-2"
                          >
                            <CheckCircle className="h-4 w-4" /> Duyệt
                          </button>
                          <button
                            onClick={() => setSelectedTutor({ ...tutor, showReject: true })}
                            className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-all flex items-center gap-2"
                          >
                            <XCircle className="h-4 w-4" /> Từ chối
                          </button>
                        </div>

                        {selectedTutor?.id === tutor.id && selectedTutor.showReject && (
                          <div className="mt-4 p-4 bg-red-50 rounded-xl">
                            <label className="block text-sm font-bold text-red-700 mb-2">
                              Lý do từ chối
                            </label>
                            <textarea
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="Nhập lý do từ chối..."
                              className="w-full px-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20"
                              rows={2}
                            />
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() => handleReject(tutor.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                              >
                                Xác nhận từ chối
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedTutor(null);
                                  setRejectReason("");
                                }}
                                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300"
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {pendingTutors.length === 0 && !loading && (
                  <div className="text-center py-12 text-slate-400">
                    <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Không có đăng ký nào chờ duyệt</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal chi tiết */}
      {selectedTutor && !selectedTutor.showReject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">
                Chi tiết đăng ký gia sư
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <ImageWithFallback
                  src={selectedTutor.avatar}
                  alt={selectedTutor.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-bold text-lg">{selectedTutor.name}</h4>
                  <p className="text-slate-500">{selectedTutor.email}</p>
                </div>
              </div>
              <div>
                <h5 className="font-bold mb-2">Chứng chỉ/Bằng cấp</h5>
                <p className="text-slate-600">
                  {selectedTutor.certificates || "Chưa cung cấp"}
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setSelectedTutor(null)}
                className="px-6 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200"
              >
                Đóng
              </button>
              <button
                onClick={() => handleApprove(selectedTutor.id)}
                className="px-6 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700"
              >
                Duyệt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}