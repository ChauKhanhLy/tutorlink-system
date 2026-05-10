import React from "react";
import { Calendar, Users, Wallet, Star, Clock, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { tutorApi } from "../api/tutorApi";
import { bookingApi } from "../api/bookingApi";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

export function TutorDashboard() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const isPending = user?.role === "tutor" && user?.verified === false;
  const isNewTutor = user?.role === "tutor" && !user?.bio;
  const [stats, setStats] = React.useState({
    todaySessions: 0,
    totalStudents: 0,
    monthlyEarnings: 0,
    avgRating: 0,
  });
  const [loadingUser, setLoadingUser] = React.useState(true);
  const [upcomingSessions, setUpcomingSessions] = React.useState([]);
  const [availability, setAvailability] = React.useState([]);
  const [showAvailabilityModal, setShowAvailabilityModal] = React.useState(false);

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
        setAvailability(
          availabilityRes.data?.availableSlots || availabilityRes.data || [],
        );
      } catch (err) {
        console.error(err);
      }
    };
    if (user?.id && !isPending) fetchTutorData();
  }, [user?.id, isPending]);
  React.useEffect(() => {
    const loadUser = async () => {
      if (!user?.id) return;

      await refreshUser();
      setLoadingUser(false);
    };

    loadUser();
  }, [user?.id]);
  if (loadingUser) return <div>Loading...</div>;
  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Xin chào, {user?.name}
          </h1>
          <p className="text-slate-500">Quản lý lớp học và thu nhập của bạn</p>
          {/* 🔥 THÊM ĐOẠN NÀY */}
          {isPending && (
            <div className="mt-4 p-5 bg-yellow-50 border border-yellow-200 rounded-2xl">
              <p className="text-yellow-700 font-semibold mb-2">
                Bạn chưa phải gia sư chính thức
              </p>

              <p className="text-sm text-yellow-600 mb-4">
                Hãy hoàn thiện hồ sơ để gửi admin xét duyệt
              </p>

              <button
                onClick={() => navigate("/become-tutor")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700"
              >
                Đăng ký gia sư chính thức
              </button>
            </div>
          )}
        </div>

        {/* Stats - chỉ hiện khi đã duyệt */}
        {!isPending && (
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
              value={`${stats.monthlyEarnings.toLocaleString("vi-VN")} ₫`}
              color="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              icon={Star}
              label="Đánh giá"
              value={stats.avgRating.toFixed(1)}
              color="bg-amber-50 text-amber-600"
            />
          </div>
        )}
        {/* Grid: Upcoming Sessions & Availability */}
        {!isPending && (
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
                    <SessionCard
                      key={session.id}
                      session={session}
                      isPending={isPending}
                    />
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-8">
                    Chưa có lịch dạy nào sắp tới
                  </p>
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
                    <div
                      key={index}
                      className="border-b border-slate-50 last:border-0 pb-4 last:pb-0"
                    >
                      <p className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-400" />
                        {new Date(slot.date).toLocaleDateString("vi-VN", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {slot.times.map((time, tIndex) => (
                          <span
                            key={tIndex}
                            className="px-3 py-1 bg-slate-50 text-slate-600 text-xs font-medium rounded-lg border border-slate-100"
                          >
                            {time}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-8">
                    Chưa cập nhật lịch rảnh
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowAvailabilityModal(true)}
                className="mt-6 w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 font-bold text-sm hover:border-indigo-300 hover:text-indigo-600 transition-all"
              >
                Cập nhật lịch rảnh
              </button>
            </div>
          </div>
        )}
        {/* 🔥 PENDING: placeholder thay thế */}
        {isPending && (
          <div className="mt-10 text-center text-slate-400">
            Các chức năng sẽ mở sau khi bạn được duyệt
          </div>
        )}
      </div>

      {showAvailabilityModal && (
        <AvailabilityModal
          onClose={() => setShowAvailabilityModal(false)}
          onSave={async (data) => {
            try {
              await tutorApi.updateAvailability(user.id, data);

              const availabilityRes = await tutorApi.getAvailability(user.id);

              setAvailability(
                availabilityRes.data?.availableSlots ||
                availabilityRes.data ||
                []
              );
            } catch (err) {
              console.error(err);
            }
          }}
        />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6" /> {/* <-- Sử dụng Icon ở đây */}
        </div>
        <span className="text-sm font-medium text-slate-500">{label}</span>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function SessionCard({ session, isPending }) {
  const now = new Date();
  const startTime = new Date(
    session.room_start_time || session.datetime || session.date,
  );
  const endTime = new Date(
    session.room_end_time || new Date(startTime).getTime() + 60 * 60 * 1000,
  );

  // Cho phép vào phòng bất cứ lúc nào nếu có room_id (phục vụ testing)
  //const canJoin = !!session.room_id && session.status !== 'cancel' && session.status !== 'done';
  const canJoin =
    (!!session.room_id || !!session.roomId) &&
    session.status !== "cancel" &&
    session.status !== "done";

  if (session.type === "trial" || session.status === "confirmed") {
    console.log(
      "Tutor Confirmed/Trial Session details:",
      JSON.stringify(session, null, 2),
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
          <Clock className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <p className="font-bold text-slate-900">
            {session.subject || "Lớp học"}
          </p>
          <p className="text-sm text-slate-500">
            {session.studentName} •{" "}
            {session.time ||
              new Date(startTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
          </p>
        </div>
      </div>
      {canJoin ? (
        <Link
          //to={`/room/${session.room_id}`}
          to={`/room/${session.room_id || session.roomId}`}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
        >
          Vào lớp
        </Link>
      ) : (
        <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-400 cursor-not-allowed">
          {session.room_id || session.roomId ? "Chưa đến giờ" : "Chờ xác nhận"}
        </button>
      )}
    </div>
  );
}
  

function AvailabilityModal({ onClose, onSave }) {
  const [selectedDate, setSelectedDate] = React.useState("");
  const [selectedTimes, setSelectedTimes] = React.useState([]);
  const [availabilityMap, setAvailabilityMap] = React.useState({});
  const [repeatWeekly, setRepeatWeekly] = React.useState(false);

  const TIMES = [
    "08:00","09:00","10:00","11:00",
    "13:00","14:00","15:00","16:00",
    "19:00","20:00","21:00",
  ];

  const toggleTime = (time) => {
    setSelectedTimes(prev =>
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
  };

  const addCurrentDate = () => {
    if (!selectedDate) return alert("Vui lòng chọn ngày");
    if (selectedTimes.length === 0) return alert("Vui lòng chọn ít nhất một khung giờ");
    setAvailabilityMap(prev => ({ ...prev, [selectedDate]: selectedTimes }));
    setSelectedDate("");
    setSelectedTimes([]);
  };

  const removeDate = (date) => {
    const newMap = { ...availabilityMap };
    delete newMap[date];
    setAvailabilityMap(newMap);
  };

  const handleSubmit = async () => {
    if (Object.keys(availabilityMap).length === 0) return alert("Chưa có ngày nào được thêm");
    const datesArray = Object.entries(availabilityMap).map(([date, times]) => ({ date, times }));
    await onSave({ dates: datesArray, repeatWeekly });
    onClose();
  };

  const formatDisplayDate = (isoDate) => {
    const d = new Date(isoDate);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Cập nhật lịch rảnh</h2>
            <p className="text-slate-500 text-sm">Chọn ngày + giờ → Thêm ngày → Lưu</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-100 text-slate-500 text-xl">
            ✕
          </button>
        </div>

        {/* 2 cột */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Bên trái - chọn ngày */}
          <div className="p-6 border-r border-slate-100 bg-slate-50">
            <label className="text-sm font-bold text-slate-700 block mb-2">Chọn ngày</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-indigo-500"
            />

            <div className="mt-6 bg-white rounded-2xl p-4 border shadow-sm">
              <p className="font-bold text-slate-800 mb-3">Lặp lại hàng tuần</p>
              <button
                onClick={() => setRepeatWeekly(!repeatWeekly)}
                className={`w-full py-3 rounded-xl font-bold transition ${
                  repeatWeekly ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {repeatWeekly ? "✓ Bật lặp 8 tuần" : "Bật lặp mỗi tuần"}
              </button>
            </div>

            <button
              onClick={addCurrentDate}
              className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
            >
              + Thêm ngày này
            </button>
          </div>

          {/* Bên phải - chọn giờ */}
          <div className="p-6">
            <label className="text-sm font-bold text-slate-700 block mb-3">Chọn khung giờ</label>
            <div className="grid grid-cols-3 gap-3">
              {TIMES.map(time => {
                const active = selectedTimes.includes(time);
                return (
                  <button
                    key={time}
                    onClick={() => toggleTime(time)}
                    className={`py-3 rounded-xl font-bold text-sm transition ${
                      active
                        ? "bg-indigo-600 text-white shadow-md scale-105"
                        : "bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Preview khung tím tím (giữ nguyên style cũ) */}
        <div className="mx-6 mb-6 p-5 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl">
          <p className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
            📋 Preview lịch sẽ tạo
          </p>
          {Object.keys(availabilityMap).length === 0 ? (
            <p className="text-indigo-700 text-sm italic">Chưa có ngày nào được thêm</p>
          ) : (
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {Object.entries(availabilityMap).map(([date, times]) => (
                <div key={date} className="flex items-center justify-between bg-white/70 rounded-xl px-3 py-2">
                  <span className="font-mono font-bold text-indigo-900 min-w-[110px]">
                    {formatDisplayDate(date)}:
                  </span>
                  <span className="text-indigo-700 text-sm flex-1 mx-2">{times.join(", ")}</span>
                  <button onClick={() => removeDate(date)} className="text-indigo-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer nút */}
        <div className="flex justify-end gap-3 px-6 pb-6 pt-2 border-t border-slate-100">
          <button onClick={onClose} className="px-5 py-2 rounded-xl border border-slate-200 font-semibold">
            Huỷ
          </button>
          <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-md">
            Lưu lịch
          </button>
        </div>
      </div>
    </div>
  );
}