// src/pages/Booking.jsx
import React from "react";
import { Calendar, Clock, Video, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { bookingApi } from "../api/bookingApi";
import { tutorApi } from "../api/tutorApi";
import { ImageWithFallback } from "../components/Image/ImageWithFallback";
import { getAvatarUrl } from "../utils/avatar.js";

export function BookingPage() {
  const [bookings, setBookings] = React.useState([]);
  const [tutors, setTutors] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("upcoming"); // upcoming, past, cancelled

  React.useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingApi.getMyBookings();
      const bookingsData = res.data || [];

      // Fetch tutor info for each booking
      const tutorIds = [...new Set(bookingsData.map(b => b.tutorId))];
      const tutorPromises = tutorIds.map(id => tutorApi.getById(id));
      const tutorResponses = await Promise.all(tutorPromises);
      const tutorsMap = {};
      tutorResponses.forEach(res => {
        tutorsMap[res.data.id] = res.data;
      });
      setTutors(tutorsMap);
      setBookings(bookingsData);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      toast.error("Không thể tải danh sách đặt lịch");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      await bookingApi.cancel(bookingId);
      toast.success("Đã hủy đặt lịch thành công");
      fetchBookings(); // Refresh
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      toast.error("Hủy thất bại, vui lòng thử lại");
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date || booking.startTime);
    const today = new Date();
    if (activeTab === "upcoming") return bookingDate >= today && booking.status !== "cancelled" && booking.status !== "cancel";
    if (activeTab === "past") return bookingDate < today && booking.status !== "cancelled" && booking.status !== "cancel";
    if (activeTab === "cancelled") return booking.status === "cancelled" || booking.status === "cancel";
    return true;
  });

  const formatVND = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status, date) => {
    const isPast = new Date(date) < new Date();
    if (status === "cancelled") {
      return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Đã hủy</span>;
    }
    if (isPast) {
      return <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">Đã kết thúc</span>;
    }
    return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Sắp diễn ra</span>;
  };

  return (
    <div className="pt-24 pb-16 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Lịch đặt buổi học</h1>
          <p className="text-slate-500">Quản lý tất cả các buổi học bạn đã đặt với gia sư</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit shadow-sm">
          {[
            { id: "upcoming", label: "Sắp diễn ra" },
            { id: "past", label: "Đã qua" },
            { id: "cancelled", label: "Đã hủy" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có buổi học nào</h3>
            <p className="text-slate-500 mb-6">
              {activeTab === "upcoming"
                ? "Bạn chưa đặt lịch học nào. Hãy tìm gia sư phù hợp ngay!"
                : activeTab === "past"
                  ? "Bạn chưa có buổi học nào đã qua."
                  : "Không có buổi học nào bị hủy."}
            </p>
            <Link
              to="/search"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all"
            >
              Tìm gia sư ngay
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => {
              const tutor = tutors[booking.tutorId];
              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="p-6 flex flex-col md:flex-row gap-6">
                    {/* Tutor Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden">
                        <ImageWithFallback
                          src={
                            tutor?.avatar
                              ? getAvatarUrl(tutor.avatar)
                              : "/img/images.jpg"
                          }
                          alt={tutor?.name || "Gia sư"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row justify-between items-start mb-3">
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">{tutor?.name}</h2>
                          <p className="text-slate-500 text-sm">{tutor?.subjects?.join(", ")}</p>
                        </div>
                        {getStatusBadge(booking.status, booking.date || booking.startTime)}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center text-slate-600">
                          <Calendar className="h-5 w-5 text-indigo-500 mr-3" />
                          <span className="font-medium">{new Date(booking.date || booking.startTime).toLocaleDateString("vi-VN")}</span>
                        </div>
                        <div className="flex items-center text-slate-600">
                          <Clock className="h-5 w-5 text-indigo-500 mr-3" />
                          <span className="font-medium">{booking.time} ({booking.type === 'trial' ? '50 phút' : '2 tiếng'})</span>
                        </div>
                        <div className="flex items-center text-slate-600">
                          <Video className="h-5 w-5 text-indigo-500 mr-3" />
                          <span className="font-medium">Zoom / Google Meet</span>
                        </div>
                        <div className="flex items-center text-slate-600">
                          <span className="font-bold text-indigo-600">
                            {booking.type === "trial" ? "Học thử (0đ)" : formatVND(booking.fee || tutor?.hourlyRate)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {new Date(booking.date || booking.startTime) >= new Date() && booking.status !== "cancelled" && booking.status !== "cancel" && (
                          <>
                            <Link
                              to={`/lesson/${booking.id}`}
                              className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all"
                            >
                              Tham gia buổi học
                            </Link>
                            <button
                              onClick={() => cancelBooking(booking.id)}
                              className="px-5 py-2.5 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all"
                            >
                              Hủy lịch
                            </button>
                          </>
                        )}
                        {new Date(booking.date || booking.startTime) < new Date() && booking.status !== "cancelled" && booking.status !== "cancel" && (
                          <Link
                            to={`/review?tutorId=${booking.tutorId}&bookingId=${booking.id}`}
                            className="px-5 py-2.5 bg-amber-100 text-amber-700 font-bold rounded-xl hover:bg-amber-200 transition-all"
                          >
                            Viết đánh giá
                          </Link>
                        )}
                        <Link
                          to={`/tutor/${booking.tutorId}`}
                          className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                        >
                          Xem hồ sơ gia sư
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}