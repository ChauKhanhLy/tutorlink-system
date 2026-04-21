import React from "react";
import { Calendar, Users, DollarSign, Star, Clock } from "lucide-react";
import { Link } from "react-router-dom";
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
  const [availability, setAvailability] = React.useState([]);

  React.useEffect(() => {
    const fetchTutorData = async () => {
      try {
        const [statsRes, sessionsRes, availabilityRes] = await Promise.all([
          tutorApi.getTutorStats(),
          bookingApi.getTutorBookings(),
          tutorApi.getAvailability(user.id),
        ]);
        setStats(statsRes.data.data || statsRes.data);
        setUpcomingSessions(sessionsRes.data || []);
        setAvailability(availabilityRes.data?.availableSlots || availabilityRes.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    if (user?.id) fetchTutorData();
  }, [user?.id]);

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

        {/* Grid: Upcoming Sessions & Availability */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Sessions */}
          <div className="lg:col-cols-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              Lịch dạy sắp tới
            </h2>
            <div className="space-y-4">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))
              ) : (
                <p className="text-slate-400 text-center py-8">Chưa có lịch dạy nào sắp tới</p>
              )}
            </div>
          </div>

          {/* My Availability */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              Lịch rảnh của tôi
            </h2>
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {availability.length > 0 ? (
                availability.map((slot, index) => (
                  <div key={index} className="border-b border-slate-50 last:border-0 pb-4 last:pb-0">
                    <p className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-400" />
                      {new Date(slot.date).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {slot.times.map((time, tIndex) => (
                        <span key={tIndex} className="px-3 py-1 bg-slate-50 text-slate-600 text-xs font-medium rounded-lg border border-slate-100">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-center py-8">Chưa cập nhật lịch rảnh</p>
              )}
            </div>
            <Link 
              to="/become-tutor" 
              className="mt-6 w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 font-bold text-sm hover:border-indigo-300 hover:text-indigo-600 transition-all"
            >
              Cập nhật lịch rảnh
            </Link>
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
  const now = new Date();
  const startTime = new Date(session.room_start_time || session.datetime || session.date);
  const endTime = new Date(session.room_end_time || (new Date(startTime).getTime() + 60 * 60 * 1000));
  
  // Cho phép vào phòng bất cứ lúc nào nếu có room_id (phục vụ testing)
  const canJoin = !!session.room_id && session.status !== 'cancel' && session.status !== 'done';


  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
          <Clock className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <p className="font-bold text-slate-900">{session.subject || "Lớp học"}</p>
          <p className="text-sm text-slate-500">
            {session.studentName} • {session.time || new Date(startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </p>
        </div>
      </div>
      {canJoin ? (
        <Link 
          to={`/room/${session.room_id}`}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
        >
          Vào lớp
        </Link>
      ) : (
        <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-400 cursor-not-allowed">
          {session.room_id ? "Chưa đến giờ" : "Chờ xác nhận"}
        </button>
      )}
    </div>
  );
}