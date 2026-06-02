import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Shield, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import authApi from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

export function AdminLogin() {
  const navigate = useNavigate();
  const { user ,login } = useAuth();
  const [loading, setLoading] = React.useState(false);

  // Tự động chuyển hướng khi user đã là admin
  React.useEffect(() => {
    if (
    user &&
    ["admin", "tutor_manager", "support_staff"].includes(
      user.role
    )
  ) {
    navigate("/admin/dashboard", {
      replace: true,
    });
  }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const email = e.target.email.value;
      const password = e.target.password.value;

      const res = await authApi.login({ email, password });

        // ❗ check role trực tiếp từ res
          if (
            ![
              "admin",
              "tutor_manager",
              "support_staff",
            ].includes(res.data.user.role)
          ) {
            toast.error(
              "Tài khoản không có quyền truy cập"
            );
            setLoading(false);
            return;
          }
        // 🔥 format đúng cho AuthContext
        login({
          user: res.data.user,
          token: res.data.token,
        });

        toast.success( `Đăng nhập ${
    res.data.user.role === "admin"
      ? "Admin"
      : res.data.user.role ===
        "tutor_manager"
      ? "Tutor Manager"
      : "Support Staff"
  } thành công!`
);

        // 🔥 điều hướng luôn (không cần chờ useEffect)
        navigate("/admin/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">TutorLink Admin</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Đăng nhập Quảng trị
          </h2>
          <p className="text-slate-500 mb-8">
            Truy cập bảng điều khiển quản trị
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="admin@tutorlink.com"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-indigo-600 hover:underline">
              ← Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}