import React from "react";
import { Navigate } from "react-router-dom";
import {
  Search,
  Shield,
  Ban,
  CheckCircle,
  Users as UsersIcon,
} from "lucide-react";
import { toast } from "sonner";
import adminApi from "../../api/adminApi";
import { useAuth } from "../../context/AuthContext";
import { ImageWithFallback } from "../../components/Image/ImageWithFallback";

export function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers();
      setUsers(res.data || []);
    } catch (err) {
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBan = async (userId, currentBanned) => {
    try {
      await adminApi.updateUserStatus(userId, { banned: !currentBanned });
      toast.success(
        currentBanned ? "Đã mở khóa người dùng" : "Đã khóa người dùng",
      );
      fetchUsers();
    } catch (err) {
      toast.error("Thao tác thất bại");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Chỉ admin mới được vào
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/admin/login" replace />;

  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <UsersIcon className="h-8 w-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-slate-900">
            Quản lý người dùng
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl bg-white"
            >
<option value="all">Tất cả vai trò</option>
<option value="learner">Học viên</option>
<option value="tutor">Gia sư</option>
<option value="admin">Admin</option>
<option value="tutor_manager">Tutor Manager</option>
<option value="support_staff">Support Staff</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr className="text-left text-sm font-bold text-slate-500">
                    <th className="p-4">Người dùng</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Vai trò</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="border-t border-slate-100 hover:bg-slate-50/50"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <ImageWithFallback
                            src={
                              u.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                u.name
                              )}`
                            }
                            alt={u.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <span className="font-medium text-slate-900">
                            {u.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">{u.email}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                              u.role === "admin"
                                ? "bg-purple-100 text-purple-700"
                                : u.role === "tutor_manager"
                                ? "bg-orange-100 text-orange-700"
                                : u.role === "support_staff"
                                ? "bg-pink-100 text-pink-700"
                                : u.role === "tutor"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                        >
                          {
                              u.role === "learner"
                              ? "Học viên"
                              : u.role === "tutor"
                              ? "Gia sư"
                              : u.role === "admin"
                              ? "Admin"
                              : u.role === "tutor_manager"
                              ? "Tutor Manager"
                              : u.role === "support_staff"
                              ? "Support Staff"
                              : u.role
                          }
                        </span>
                      </td>
                      <td className="p-4">
                        {u.banned ? (
                          <span className="text-red-600 flex items-center gap-1">
                            <Ban className="h-4 w-4" /> Bị khóa
                          </span>
                        ) : (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" /> Hoạt động
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleBan(u.id, u.banned)}
                          className="text-sm font-medium text-indigo-600 hover:underline"
                        >
                          {u.banned ? "Mở khóa" : "Khóa"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  Không tìm thấy người dùng nào
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}