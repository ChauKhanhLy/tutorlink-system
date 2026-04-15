import React from "react";
import { Calendar, Users, DollarSign, Star, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { tutorApi } from "../api/tutorApi";
import { bookingApi } from "../api/bookingApi";

export function TutorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = React.useState({
    todaySessions: 0,
    totalStudents: 0,
    monthlyEarnings: 0,
    avgRating: 0,
  });
  const [upcomingSessions, setUpcomingSessions] = React.useState([]);

  React.useEffect(() => {
    const fetchTutorData = async () => {
      try {
        // Giả sử có API /tutor/stats và /tutor/sessions
        const [statsRes, sessionsRes] = await Promise.all([
          tutorApi.getTutorStats(),
          bookingApi.getTutorBookings(),
        ]);
        setStats(statsRes.data);
        setUpcomingSessions(sessionsRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    };
    fetchTutorData();
  }, []);

  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Xin chào, {user?.name}
          </h1>
          <p className="text-slate-500">Quản lý lớp học và thu nhập của bạn</p>
        </div>

        {/* Stats Grid */}
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
            icon={DollarSign}
            label="Thu nhập tháng"
            value={`$${stats.monthlyEarnings}`}
            color="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            icon={Star}
            label="Đánh giá"
            value={stats.avgRating.toFixed(1)}
            color="bg-amber-50 text-amber-600"
          />
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Lịch dạy sắp tới
          </h2>
          <div className="space-y-4">
            {upcomingSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6" />  {/* <-- Sử dụng Icon ở đây */}
        </div>
        <span className="text-sm font-medium text-slate-500">{label}</span>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function SessionCard({ session }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
          <Clock className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <p className="font-bold text-slate-900">{session.subject}</p>
          <p className="text-sm text-slate-500">
            {session.studentName} • {session.time}
          </p>
        </div>
      </div>
      <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold">
        Vào lớp
      </button>
    </div>
  );
}