import React from "react";
import {
  Calendar,
  Users,
  Wallet,
  Star,
  Clock,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { tutorApi } from "../api/tutorApi.js";

import { WalletPage } from "./Wallet.jsx";
import { toast } from "sonner";

export function TutorDashboard() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const isPending =
    user?.role === "tutor" &&
    user?.verified === false;

  const [loadingUser, setLoadingUser] =
    React.useState(true);

  const [stats, setStats] =
    React.useState({
      todaySessions: 0,
      totalStudents: 0,
      monthlyEarnings: 0,
      avgRating: 0,
    });
   const [activeTab, setActiveTab] = React.useState("sessions");
  const fetchTutorData = async () => {
    if (!user?.id || isPending) return;

    try {
      const statsRes =
        await tutorApi.getTutorStats();

      setStats(
        statsRes.data.data ||
        statsRes.data
      );
    } catch (err) {
      console.error(err);
      toast.error(
        "Không thể tải dữ liệu"
      );
    }
  };

  React.useEffect(() => {
    const loadUser = async () => {
      if (!user?.id) return;

      await refreshUser();
      setLoadingUser(false);
    };

    loadUser();
  }, [user?.id, refreshUser]);

  React.useEffect(() => {
    if (user?.id && !isPending) {
      fetchTutorData();
    }
  }, [user?.id, isPending]);

  if (loadingUser)
    return (
      <div className="pt-24 text-center">
        Đang tải...
      </div>
    );

  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Xin chào, {user?.name}
          </h1>

          <p className="text-slate-500">
            Quản lý lớp học và thu nhập của bạn
          </p>

          {isPending && (
            <div className="mt-4 p-5 bg-yellow-50 border border-yellow-200 rounded-2xl">

              <p className="text-yellow-700 font-semibold mb-2">
                Bạn chưa phải gia sư chính thức
              </p>

              <p className="text-sm text-yellow-600 mb-4">
                Hãy hoàn thiện hồ sơ để gửi admin xét duyệt
              </p>

              <button
                onClick={() =>
                  navigate("/become-tutor")
                }
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700"
              >
                Đăng ký gia sư chính thức
              </button>

            </div>
          )}
        </div>

        {!isPending && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

              <StatCard
                icon={Calendar}
                label="Buổi học hôm nay"
                value={stats.todaySessions}
                color="bg-blue-50 text-blue-600"
              />

              <StatCard
                icon={Users}
                label="Học viên"
                value={stats.totalStudents}
                color="bg-green-50 text-green-600"
              />

              <StatCard
                icon={Wallet}
                label="Thu nhập tháng"
                value={`${stats.monthlyEarnings.toLocaleString(
                  "vi-VN"
                )} ₫`}
                color="bg-emerald-50 text-emerald-600"
              />

              <StatCard
                icon={Star}
                label="Đánh giá"
                value={stats.avgRating.toFixed(1)}
                color="bg-amber-50 text-amber-600"
              />

            </div>
           
            
            {/* Quick Menu */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">

              <Link
                to="/tutor/schedule"
                className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-indigo-300 transition-all"
              >
                <Calendar className="h-10 w-10 text-indigo-600 mb-4" />

                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Lịch dạy
                </h3>

                <p className="text-slate-500">
                  Quản lý lịch học và lịch rảnh
                </p>
              </Link>

              <Link
                to="/tutor/students"
                className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-indigo-300 transition-all"
              >
                <Users className="h-10 w-10 text-indigo-600 mb-4" />

                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Học viên
                </h3>

                <p className="text-slate-500">
                  Danh sách học viên học thử và học chính thức
                </p>
              </Link>

            </div>

            {/* Wallet */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <WalletPage />
            </div>
          </>
        )}

        {isPending && (
          <div className="mt-10 text-center text-slate-400">
            Các chức năng sẽ mở sau khi bạn được duyệt
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`p-3 rounded-xl ${color}`}
        >
          <Icon className="h-6 w-6" />
        </div>

        <span className="text-sm font-medium text-slate-500">
          {label}
        </span>
      </div>

      <p className="text-3xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}