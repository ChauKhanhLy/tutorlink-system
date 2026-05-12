import React from "react";
import { Calendar, Users, DollarSign, Star, Clock, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { tutorApi } from "../api/tutorApi";
import { bookingApi } from "../api/bookingApi";
import { useNavigate } from "react-router-dom";
import { ImageWithFallback } from "../components/Image/ImageWithFallback";
import { toast } from "sonner";
import { WalletPage } from "./Wallet.jsx";

export function TutorDashboard() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const isPending = user?.role === "tutor" && user?.verified === false; 
  const isNewTutor = user?.role === "tutor" && !user?.bio ;
  const [stats, setStats] = React.useState({
    todaySessions: 0,
    totalStudents: 0,
    monthlyEarnings: 0,
    avgRating: 0,
  });
  const [loadingUser, setLoadingUser] = React.useState(true);
  const [upcomingSessions, setUpcomingSessions] = React.useState([]);
  const [availability, setAvailability] = React.useState([]);
  const [activeTab, setActiveTab] = React.useState("sessions"); // sessions, wallet, availability
  
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

  React.useEffect(() => {
    if (user?.id && !isPending) fetchTutorData();
  }, [user?.id, isPending]);

  const handleAccept = async (bookingId) => {
    try {
      if (window.confirm("Bạn có chắc chắn muốn chấp nhận lịch học này?")) {
        await bookingApi.accept(bookingId);
        toast.success("Đã chấp nhận lịch học và hoàn tất thanh toán!");
        await fetchTutorData(); // Refresh list
      }
    } catch (err) {
      console.error("Lỗi khi chấp nhận lịch học:", err);
      toast.error(err.response?.data?.message || "Không thể chấp nhận lịch học");
    }
  };

  const handleReject = async (bookingId) => {
    try {
      if (window.confirm("Bạn có chắc chắn muốn từ chối lịch học này?")) {
        await bookingApi.reject(bookingId);
        toast.success("Đã từ chối lịch học");
        await fetchTutorData(); // Refresh list
      }
    } catch (err) {
      console.error("Lỗi khi từ chối lịch học:", err);
      toast.error(err.response?.data?.message || "Không thể từ chối lịch học");
    }
  };

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
      {!isPending &&(
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
      )}
        {/* Tabs Navigation */}
      {!isPending && (
        <>
          <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit shadow-sm">
            {[
              { id: "sessions", label: "Lịch dạy", icon: Calendar },
              { id: "wallet", label: "Ví của tôi", icon: Wallet },
              { id: "availability", label: "Lịch rảnh", icon: Clock },
            ].map(tab => (
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

          {/* Tab Content */}
          {activeTab === "sessions" && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
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
                      onAccept={() => handleAccept(session.id)}
                      onReject={() => handleReject(session.id)}
                    />
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-8">Chưa có lịch dạy nào sắp tới</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "wallet" && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <WalletPage />
            </div>
          )}

          {activeTab === "availability" && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                Lịch rảnh của tôi
              </h2>
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {availability.length > 0 ? (
                  availability.map((slot, index) => {
                    // Đảm bảo parse ngày đúng định dạng YYYY-MM-DD mà không bị lệch múi giờ
                    const [year, month, day] = slot.date.split('-').map(Number);
                    const dateObj = new Date(year, month - 1, day);
                    
                    return (
                      <div key={index} className="border-b border-slate-50 last:border-0 pb-4 last:pb-0">
                        <p className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-indigo-400" />
                          {dateObj.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {slot.times.map((time, tIndex) => (
                            <span key={tIndex} className="px-3 py-1 bg-slate-50 text-slate-600 text-xs font-medium rounded-lg border border-slate-100">
                              {time}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })
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
          )}
        </>
      )}
      {/* 🔥 PENDING: placeholder thay thế */}
      {isPending && (
        <div className="mt-10 text-center text-slate-400">
          Các chức năng sẽ mở sau khi bạn được duyệt
        </div>
      )}
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

function SessionCard({ session, isPending, onAccept, onReject }) {
  // Sử dụng dateObj đã được normalize từ bookingApi.js
  const dateObj = session.dateObj;
  const isValidDate = dateObj && !isNaN(dateObj.getTime());

  const canJoin = (!!session.room_id || !!session.roomId) && session.status !== 'cancel' && session.status !== 'done';
  
  // Chỉ sử dụng trường time đã được normalize chuẩn từ bookingApi.js
  // Không tạo lại Date object để tránh lỗi timezone
  const formattedTime = session.time || "--:--";

  const formattedDate = isValidDate ? dateObj.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh'
  }) : "Chưa xác định";

  return (
    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
              <ImageWithFallback
                src={session.studentAvatar || `https://i.pravatar.cc/150?u=${session.learner_id}`}
                alt={session.studentName}
              />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${session.type === 'trial' ? 'bg-amber-500' : 'bg-indigo-500'}`} title={session.type === 'trial' ? 'Học thử' : 'Học thật'} />
          </div>
          
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h4 className="font-bold text-slate-900 truncate">{session.subject || "Lớp học"}</h4>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                session.type === 'trial' 
                  ? 'bg-amber-100 text-amber-700' 
                  : 'bg-indigo-100 text-indigo-700'
              }`}>
                {session.type === 'trial' ? 'Học thử' : 'Học thật'}
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
                  ${session.fee}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
          {session.status === 'pending' ? (
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
              {session.status === 'cancel' ? "Đã hủy" : (session.room_id || session.roomId ? "Chưa đến giờ" : "Đã xong")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}