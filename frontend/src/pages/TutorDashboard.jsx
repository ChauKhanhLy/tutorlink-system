import React from "react";
import { Calendar, Users, DollarSign, Star, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent } from "../components/dialog";
import { useAuth } from "../context/AuthContext";
import { tutorApi } from "../api/tutorApi";
import { bookingApi } from "../api/bookingApi";

const daysOfWeek = [
  { id: 1, label: "Thứ 2" },
  { id: 2, label: "Thứ 3" },
  { id: 3, label: "Thứ 4" },
  { id: 4, label: "Thứ 5" },
  { id: 5, label: "Thứ 6" },
  { id: 6, label: "Thứ 7" },
  { id: 0, label: "Chủ nhật" },
];

const availabilityOptions = [
  { id: "morning", label: "Sáng (8:00 - 12:00)" },
  { id: "afternoon", label: "Chiều (13:00 - 17:00)" },
  { id: "evening", label: "Tối (18:00 - 22:00)" },
];

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
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
  const [editSchedule, setEditSchedule] = React.useState({});
  const [activeEditDay, setActiveEditDay] = React.useState(1);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const openUpdateModal = async () => {
    try {
      const res = await tutorApi.getMyAvailabilityPreferences();
      setEditSchedule(res.data?.schedule || {});
      setIsUpdateModalOpen(true);
    } catch (err) {
      toast.error("Không tải được lịch gốc");
    }
  };

  const handleScheduleToggle = (timeOptionId) => {
    setEditSchedule((prev) => {
      const currentSchedule = prev || {};
      const daySlots = currentSchedule[activeEditDay] || [];
      const newDaySlots = daySlots.includes(timeOptionId)
        ? daySlots.filter((id) => id !== timeOptionId)
        : [...daySlots, timeOptionId];

      const newSchedule = { ...currentSchedule };
      if (newDaySlots.length > 0) {
        newSchedule[activeEditDay] = newDaySlots;
      } else {
        delete newSchedule[activeEditDay];
      }
      return newSchedule;
    });
  };

  const submitAvailabilityUpdate = async () => {
    setIsUpdating(true);
    try {
      await tutorApi.updateMyAvailability(editSchedule);
      toast.success("Cập nhật lịch rảnh thành công");
      setIsUpdateModalOpen(false);
      // Reload UI
      const availabilityRes = await tutorApi.getAvailability(user.id);
      setAvailability(availabilityRes.data?.availableSlots || availabilityRes.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setIsUpdating(false);
    }
  };

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
            <button 
              onClick={openUpdateModal}
              className="mt-6 w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 font-bold text-sm hover:border-indigo-300 hover:text-indigo-600 transition-all"
            >
              Cập nhật lịch rảnh
            </button>
          </div>
        </div>
      </div>

      {/* Modal cập nhật lịch rảnh riêng biệt */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="max-w-xl">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Cập nhật lịch rảnh</h2>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">
              Chọn ngày thiết lập lịch rảnh <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-6">
              {daysOfWeek.map((day) => {
                const hasSchedule = editSchedule?.[day.id]?.length > 0;
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => setActiveEditDay(day.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeEditDay === day.id
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                        : hasSchedule
                        ? "bg-indigo-100 text-indigo-700 border border-indigo-200 hover:bg-indigo-200"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {day.label}
                    {hasSchedule && <span className="ml-1.5 w-2 h-2 inline-block rounded-full bg-indigo-500" />}
                  </button>
                );
              })}
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl relative">
              <div className="absolute -top-3 left-6 bg-slate-50 px-2 text-xs font-bold text-slate-500 uppercase">
                Khung giờ rảnh cho {daysOfWeek.find((d) => d.id === activeEditDay)?.label}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                {availabilityOptions.map((option) => {
                  const isSelected = (editSchedule?.[activeEditDay] || []).includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleScheduleToggle(option.id)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                          : "bg-white border text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Clock className="h-4 w-4" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
              {(!editSchedule?.[activeEditDay] || editSchedule[activeEditDay].length === 0) && (
                <p className="mt-3 text-xs text-slate-400 text-center">
                  Ngày này hiện đang trống lịch rảnh.
                </p>
              )}
            </div>
            
            <div className="mt-8 flex justify-end gap-3">
              <button 
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all"
              >
                Hủy
              </button>
              <button 
                disabled={isUpdating}
                onClick={submitAvailabilityUpdate}
                className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {isUpdating ? "Đang xử lý..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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