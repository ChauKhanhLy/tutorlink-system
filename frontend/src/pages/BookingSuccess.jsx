import React from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  Calendar,
  Clock,
  User,
  ArrowRight,
  CreditCard,
  BookOpen,
  MapPin,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { bookingApi } from "../api/bookingApi";
import { ImageWithFallback } from "../components/Image/ImageWithFallback";
import { toast } from "sonner";

export function BookingSuccessPage() {
  const { id } = useParams();
  const [booking, setBooking] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const res = await bookingApi.getById(id);
        setBooking(res.data);
      } catch (err) {
        console.error("Lỗi tải thông tin đặt lịch:", err);
        toast.error("Không thể tải thông tin xác nhận");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-32 flex justify-center items-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="pt-32 text-center min-h-[60vh]">
        <CheckCircle className="h-20 w-20 text-slate-200 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Không tìm thấy thông tin đặt lịch</h2>
        <Link to="/dashboard" className="text-indigo-600 font-bold mt-4 inline-block hover:underline">
          Quay lại Dashboard
        </Link>
      </div>
    );
  }

  const isTrial = booking.type === "trial";
  const formattedDate = booking.dateObj
    ? booking.dateObj.toLocaleDateString("vi-VN", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    : "Chưa xác định";

  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20"
          >
            <CheckCircle className="h-12 w-12 text-emerald-600" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold text-slate-900 mb-4"
          >
            Đặt lịch thành công!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 text-lg"
          >
            Yêu cầu của bạn đã được gửi đến gia sư. Vui lòng chờ xác nhận.
          </motion.p>
        </div>

        {/* Booking Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden mb-10"
        >
          {/* Tutor Info Banner */}
          <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
            <div className="flex items-center space-x-6 relative z-10">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white/20 shadow-lg">
                <ImageWithFallback
                  src={booking.tutorAvatar}
                  alt={booking.tutorName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">Gia sư hướng dẫn</div>
                <h3 className="text-2xl font-bold">{booking.tutorName}</h3>
                <div className="flex items-center mt-1 text-indigo-100 text-sm">
                  <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                  <Link to={`/classroom/${booking.tutor_id || booking.tutorId}/${booking.subject_id || booking.subjectId}`} className="hover:underline font-bold">
                    {booking.subjectName || "Môn học"}
                  </Link>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          {/* Details Grid */}
          <div className="p-10">
            <div className="grid md:grid-cols-2 gap-10 mb-10">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-slate-50 rounded-2xl text-indigo-600">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ngày học</div>
                    <div className="font-bold text-slate-900">{formattedDate}</div>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-slate-50 rounded-2xl text-indigo-600">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Thời gian</div>
                    <div className="font-bold text-slate-900">{booking.time} ({isTrial ? '50 phút' : '2 tiếng'})</div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-slate-50 rounded-2xl text-indigo-600">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Học phí</div>
                    <div className="font-bold text-slate-900">
                      {isTrial ? "Miễn phí (Học thử)" : `${booking.fee?.toLocaleString('vi-VN')}đ`}
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-slate-50 rounded-2xl text-indigo-600">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Hình thức</div>
                    <div className="font-bold text-slate-900">Online (Jitsi Meet)</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-bold text-slate-600">Trạng thái đặt lịch</span>
              </div>
              <span className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                {booking.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link
            to="/dashboard"
            className="flex-1 px-8 py-5 bg-indigo-600 text-white text-center font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20"
          >
            Về Dashboard
          </Link>
          <Link
            to={`/messages?tutorId=${booking.tutorId}`}
            className="flex-1 px-8 py-5 bg-white border-2 border-slate-200 text-slate-700 text-center font-bold rounded-2xl hover:bg-slate-50 transition-all"
          >
            Nhắn tin cho gia sư
          </Link>
        </div>

        {/* Suggestion Section */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 text-center relative overflow-hidden group">
          <div className="relative z-10">
            <h4 className="text-xl font-bold text-slate-900 mb-2">Muốn tìm hiểu thêm về {booking.subjectName}?</h4>
            <p className="text-slate-500 mb-6 font-medium">Khám phá lộ trình học tập và đội ngũ gia sư hàng đầu cho môn học này.</p>
            <Link
              to={`/classroom/${booking.tutor_id || booking.tutorId}/${booking.subject_id || booking.subjectId}`}
              className="inline-flex items-center font-bold text-indigo-600 group-hover:translate-x-2 transition-transform duration-300"
            >
              Xem chi tiết lớp học <ChevronRight className="ml-1 h-5 w-5" />
            </Link>
          </div>
          <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600 group-hover:w-4 transition-all"></div>
        </div>
      </div>
    </div>
  );
}
