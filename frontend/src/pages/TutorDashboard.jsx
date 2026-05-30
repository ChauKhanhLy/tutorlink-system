import React from "react";
import {
  Calendar,
  Users,
  Wallet,
  Star,
  Clock,
  Trash2,
  DollarSign,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { tutorApi } from "../api/tutorApi";
import { bookingApi } from "../api/bookingApi";
import { FeedbackMiniPage } from "../components/FeedbackMiniPage";

import { ImageWithFallback } from "../components/Image/ImageWithFallback";
import { WalletPage } from "./Wallet.jsx";
import DatePicker from "react-multi-date-picker";
import "react-multi-date-picker/styles/colors/purple.css";
import { getAvatarUrl } from "../utils/avatar.js";

import { toast } from "sonner";

export function TutorDashboard() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const isPending = user?.role === "tutor" && user?.verified === false;

  const [loadingUser, setLoadingUser] = React.useState(true);
  const [loadingAvailability, setLoadingAvailability] = React.useState(false);

  const [stats, setStats] = React.useState({
    todaySessions: 0,
    totalStudents: 0,
    monthlyEarnings: 0,
    avgRating: 0,
  });

  const [upcomingSessions, setUpcomingSessions] = React.useState([]);
  const [availability, setAvailability] = React.useState([]);

  const [activeTab, setActiveTab] = React.useState("sessions");
  const [showAvailabilityModal, setShowAvailabilityModal] =
    React.useState(false);

  const fetchTutorData = async () => {
    if (!user?.id || isPending) return;
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
      toast.error("Không thể tải dữ liệu");
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

  const handleAccept = async (bookingId) => {
    try {
      if (window.confirm("Bạn có chắc chắn muốn chấp nhận lịch học này?")) {
        await bookingApi.accept(bookingId);
        toast.success("Đã chấp nhận lịch học và hoàn tất thanh toán!");
        await fetchTutorData();
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Không thể chấp nhận lịch học",
      );
    }
  };

  const handleReject = async (bookingId) => {
    try {
      if (window.confirm("Bạn có chắc chắn muốn từ chối lịch học này?")) {
        await bookingApi.reject(bookingId);
        toast.success("Đã từ chối lịch học");
        await fetchTutorData();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Không thể từ chối lịch học");
    }
  };

  const handleUpdateAvailability = async (data) => {
    setLoadingAvailability(true);
    try {
      await tutorApi.updateAvailability(user.id, data);
      toast.success("Cập nhật lịch rảnh thành công!");
      await fetchTutorData(); // refresh toàn bộ dữ liệu
      setShowAvailabilityModal(false);
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Cập nhật thất bại, vui lòng thử lại",
      );
    } finally {
      setLoadingAvailability(false);
    }
  };

  if (loadingUser) return <div className="pt-24 text-center">Đang tải...</div>;

  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Xin chào, {user?.name}
          </h1>
          <p className="text-slate-500">Quản lý lớp học và thu nhập của bạn</p>

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

            {/* Tabs */}
            <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit shadow-sm">
              {[
                { id: "sessions", label: "Lịch dạy", icon: Calendar },
                { id: "wallet", label: "Ví của tôi", icon: Wallet },
                { id: "availability", label: "Lịch rảnh", icon: Clock },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sessions */}
            {activeTab === "sessions" && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  Lịch dạy sắp tới
                </h2>
                <div className="space-y-4">
                  {upcomingSessions.length > 0 ? (
                    upcomingSessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        onAccept={() => handleAccept(session.id)}
                        onReject={() => handleReject(session.id)}
                      />
                    ))
                  ) : (
                    <p className="text-slate-400 text-center py-8">
                      Chưa có lịch dạy nào sắp tới
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Wallet */}
            {activeTab === "wallet" && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <WalletPage />
              </div>
            )}

            {/* Availability */}
            {activeTab === "availability" && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  Lịch rảnh của tôi
                </h2>
                <div className="max-h-[420px] overflow-y-auto pr-3 custom-scrollbar">
                  <div className="space-y-6">
                    {availability.length > 0 ? (
                      availability.map((slot, index) => {
                        const [year, month, day] = slot.date
                          .split("-")
                          .map(Number);
                        const dateObj = new Date(year, month - 1, day);
                        return (
                          <div key={index}>
                            <p className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-indigo-400" />
                              {dateObj.toLocaleDateString("vi-VN", {
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
                        );
                      })
                    ) : (
                      <p className="text-slate-400 text-center py-8">
                        Chưa cập nhật lịch rảnh
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowAvailabilityModal(true)}
                  className="mt-6 w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 font-bold text-sm hover:border-indigo-300 hover:text-indigo-600 transition-all"
                >
                  Cập nhật lịch rảnh
                </button>
              </div>
            )}
          </>
        )}

        {isPending && (
          <div className="mt-10 text-center text-slate-400">
            Các chức năng sẽ mở sau khi bạn được duyệt
          </div>
        )}
      </div>

      {showAvailabilityModal && (
        <AvailabilityModal
          onClose={() => setShowAvailabilityModal(false)}
          onSave={handleUpdateAvailability}
          isLoading={loadingAvailability}
        />
      )}
    </div>
  );
}

// ========== StatCard ==========
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <span className="text-sm font-medium text-slate-500">{label}</span>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

// ========== SessionCard ==========
function SessionCard({ session, onAccept, onReject }) {
  const [showFeedback, setShowFeedback] = React.useState(false);

  const dateObj = session.dateObj;
  const isValidDate = dateObj && !isNaN(dateObj.getTime());
  const formattedDate = isValidDate
    ? dateObj.toLocaleDateString("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "Asia/Ho_Chi_Minh",
      })
    : "Chưa xác định";

  const formattedTime = session.time || "--:--";
  const canJoin =
    (!!session.room_id || !!session.roomId) &&
    session.status !== "cancel" &&
    session.status !== "done";

  return (
    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
              <ImageWithFallback
                src={
                  session.studentAvatar
                    ? getAvatarUrl(session.studentAvatar)
                    : "/img/images.jpg"
                }
                alt={session.studentName}
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                session.type === "trial" ? "bg-amber-500" : "bg-indigo-500"
              }`}
              title={session.type === "trial" ? "Học thử" : "Học thật"}
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h4 className="font-bold text-slate-900 truncate">
                {session.subject || "Lớp học"}
              </h4>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                  session.type === "trial"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-indigo-100 text-indigo-700"
                }`}
              >
                {session.type === "trial" ? "Học thử" : "Học thật"}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1 flex items-center gap-1 truncate">
              <Users className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{session.studentName}</span>
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1 whitespace-nowrap">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1 whitespace-nowrap">
                <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                {formattedTime}
              </span>
              {session.fee > 0 && (
                <span className="flex items-center gap-1 text-emerald-600 font-bold whitespace-nowrap">
                  <DollarSign className="h-3.5 w-3.5 flex-shrink-0" />
                  {session.fee.toLocaleString("vi-VN")} ₫
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
          {session.status === "pending" ? (
            <>
              <button
                onClick={onAccept}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 transition-all flex items-center gap-2"
              >
                Nhận lớp
              </button>
              <button
                onClick={onReject}
                className="px-5 py-2.5 bg-white text-rose-600 border border-rose-100 rounded-xl text-sm font-bold hover:bg-rose-50 transition-all"
              >
                Từ chối
              </button>
            </>
          ) : canJoin ? (
            <Link
              to={`/room/${session.room_id || session.roomId}`}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all flex items-center gap-2"
            >
              Vào lớp
            </Link>
          ) : (
            <div className="px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-sm font-bold border border-slate-200">
              {session.status === "cancel"
                ? "Đã hủy"
                : session.room_id || session.roomId
                  ? "Chưa đến giờ"
                  : "Đã xong"}
            </div>
          )}
          {/* Nút báo cáo */}
          <button
            onClick={() => setShowFeedback(true)}
            className="text-red-500 text-sm px-2 py-1 rounded-lg hover:bg-red-50"
          >
            Phản hồi
          </button>
        </div>
      </div>

      {/* Modal ComplaintForm - đặt trong cùng return */}
      {showFeedback && (
        <FeedbackMiniPage
          onClose={() => setShowFeedback(false)}
          bookingId={session.id}
          targetUserId={session.studentId || session.learner_id}
          targetName={session.studentName || session.learner_name}
          targetRole="student"
        />
      )}
    </div>
  );
}

// ========== AvailabilityModal ==========
function AvailabilityModal({ onClose, onSave, isLoading = false }) {
  const [selectedDates, setSelectedDates] = React.useState([]);
  const [selectedTimes, setSelectedTimes] = React.useState([]);
  const [availabilityMap, setAvailabilityMap] = React.useState({});

  const TIMES = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "19:00",
    "20:00",
    "21:00",
  ];

  const toggleDate = (date) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date],
    );
  };

  const toggleTime = (time) => {
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time],
    );
  };

  const addCurrentDate = () => {
    if (selectedDates.length === 0) return alert("Vui lòng chọn ngày");

    if (selectedTimes.length === 0) return alert("Vui lòng chọn giờ");

    const newMap = { ...availabilityMap };

    selectedDates.forEach((dateObj) => {
      const date = dateObj.format("YYYY-MM-DD");

      newMap[date] = selectedTimes;
    });

    setAvailabilityMap(newMap);

    setSelectedDates([]);
    setSelectedTimes([]);
  };

  const removeDate = (date) => {
    const newMap = { ...availabilityMap };
    delete newMap[date];
    setAvailabilityMap(newMap);
  };

  const formatDisplayDate = (isoDate) => {
    const d = new Date(isoDate);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const handleSubmit = async () => {
    if (Object.keys(availabilityMap).length === 0)
      return alert("Chưa có ngày nào được thêm");
    const datesArray = Object.entries(availabilityMap).map(([date, times]) => ({
      date,
      times,
    }));
    await onSave({ dates: datesArray });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Cập nhật lịch rảnh
            </h2>
            <p className="text-slate-500 text-sm">
              Chọn ngày + giờ → Thêm ngày → Lưu
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-10 h-10 rounded-full hover:bg-slate-100 text-slate-500 text-xl disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-6 border-r border-slate-100 bg-slate-50">
            <label className="text-sm font-bold text-slate-700 block mb-2">
              Chọn ngày
            </label>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <DatePicker
                multiple
                value={selectedDates}
                onChange={setSelectedDates}
                format="YYYY-MM-DD"
                minDate={new Date()}
                numberOfMonths={1}
                className="purple"
                calendarPosition="bottom-center"
                inputClass="hidden"
                containerClassName="w-full"
                render={(value, openCalendar) => (
                  <button
                    onClick={openCalendar}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50 transition text-left"
                  >
                    <p className="text-sm font-bold text-slate-700 mb-1">
                      Chọn ngày dạy
                    </p>

                    {selectedDates.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedDates.map((date, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold"
                          >
                            {date.format("DD/MM")}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm">
                        Chọn một hoặc nhiều ngày
                      </p>
                    )}
                  </button>
                )}
              />
            </div>
            <button
              onClick={addCurrentDate}
              disabled={isLoading}
              className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              + Thêm ngày này
            </button>
          </div>

          <div className="p-6">
            <label className="text-sm font-bold text-slate-700 block mb-3">
              Chọn khung giờ
            </label>
            <div className="grid grid-cols-3 gap-3">
              {TIMES.map((time) => {
                const active = selectedTimes.includes(time);
                return (
                  <button
                    key={time}
                    onClick={() => toggleTime(time)}
                    disabled={isLoading}
                    className={`py-3 rounded-xl font-bold text-sm transition ${
                      active
                        ? "bg-indigo-600 text-white shadow-md scale-105"
                        : "bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"
                    } disabled:opacity-50`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mx-6 mb-6 p-5 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl">
          <p className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
            📋 Preview lịch sẽ tạo
          </p>
          {Object.keys(availabilityMap).length === 0 ? (
            <p className="text-indigo-700 text-sm italic">
              Chưa có ngày nào được thêm
            </p>
          ) : (
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {Object.entries(availabilityMap).map(([date, times]) => (
                <div
                  key={date}
                  className="flex items-center justify-between bg-white/70 rounded-xl px-3 py-2"
                >
                  <span className="font-mono font-bold text-indigo-900 min-w-[110px]">
                    {formatDisplayDate(date)}:
                  </span>
                  <span className="text-indigo-700 text-sm flex-1 mx-2">
                    {times.join(", ")}
                  </span>
                  <button
                    onClick={() => removeDate(date)}
                    disabled={isLoading}
                    className="text-indigo-400 hover:text-red-500 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2 rounded-xl border border-slate-200 font-semibold disabled:opacity-50"
          >
            Huỷ
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-md disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Đang lưu..." : "Lưu lịch"}
          </button>
        </div>
      </div>
    </div>
  );
}
