// src/pages/Lesson.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  Video,
  Clock,
  Calendar,
  Download,
  FileText,
  MessageSquare,
  ExternalLink,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { bookingApi } from "../api/bookingApi";
import { tutorApi } from "../api/tutorApi";
import { ImageWithFallback } from "../components/Image/ImageWithFallback";
import { getAvatarUrl } from "../utils/avatar.js";

export function LessonPage() {
  const { id } = useParams(); // booking id
  const [booking, setBooking] = React.useState(null);
  const [tutor, setTutor] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const joinLink = booking?.meeting_link || booking?.meetingLink || "https://zoom.us/j/123456789";

  const fetchLessonDetails = React.useCallback(async () => {
    try {
      const bookingRes = await bookingApi.getMyBookings();
      const foundBooking = bookingRes.data.find((b) => b.id === id);
      if (foundBooking) {
        setBooking(foundBooking);
        const tutorRes = await tutorApi.getById(foundBooking.tutorId);
        setTutor(tutorRes.data);
      } else {
        toast.error("Không tìm thấy thông tin buổi học");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchLessonDetails();
  }, [fetchLessonDetails]);

  const copyJoinLink = () => {
    navigator.clipboard.writeText(joinLink);
    toast.success("Đã sao chép link tham gia");
  };

  const isUpcoming = booking && new Date(booking.date || booking.startTime) >= new Date();
  const isPast = booking && new Date(booking.date || booking.startTime) < new Date();

  if (loading) {
    return (
      <div className="pt-32 flex justify-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="pt-32 text-center">
        <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Không tìm thấy buổi học</h2>
        <Link to="/dashboard" className="text-indigo-600 mt-4 inline-block">Quay lại Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="inline-flex items-center text-slate-500 hover:text-indigo-600 font-bold mb-6">
          <ChevronLeft className="h-5 w-5 mr-1" /> Quay lại Dashboard
        </Link>

        {/* Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-indigo-100">
                <ImageWithFallback
                  //src={tutor?.avatar} 
                  src={getAvatarUrl(tutor?.avatar)}
                  alt={tutor?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 mb-1">{tutor?.name}</h1>
                <p className="text-slate-500">{tutor?.subjects?.join(", ")}</p>
                <div className="flex items-center mt-2 text-sm text-slate-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{new Date(booking.date || booking.startTime).toLocaleDateString("vi-VN")}</span>
                  <Clock className="h-4 w-4 ml-3 mr-1" />
                  <span>{booking.time || new Date(booking.startTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isUpcoming && (
                <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-bold text-sm flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" /> Sắp diễn ra
                </span>
              )}
              {isPast && (
                <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm">Đã kết thúc</span>
              )}
            </div>
          </div>
        </div>

        {/* Join Section (if upcoming) */}
        {isUpcoming && (
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-3xl p-8 text-white mb-8 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Video className="h-6 w-6" />
                  <span className="font-bold uppercase tracking-wider text-sm">Phòng học trực tuyến</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">Buổi học sắp bắt đầu</h2>
                <p className="text-indigo-100 mb-4">Nhấn nút bên dưới để tham gia phòng học Zoom/Google Meet</p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={joinLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-slate-100 transition-all"
                  >
                    Tham gia ngay <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                  <button
                    onClick={copyJoinLink}
                    className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur border border-white/30 text-white font-bold rounded-2xl hover:bg-white/30 transition-all"
                  >
                    <Copy className="h-4 w-4 mr-2" /> Sao chép link
                  </button>
                </div>
              </div>
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Video className="h-12 w-12" />
              </div>
            </div>
          </div>
        )}

        {/* Lesson Materials / Notes */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Materials */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 text-indigo-600 mr-2" /> Tài liệu buổi học
            </h3>
            {isPast ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center">
                    <Download className="h-4 w-4 text-indigo-600 mr-3" />
                    <span className="text-sm font-medium">Bai_tap_chuong_3.pdf</span>
                  </div>
                  <button className="text-indigo-600 text-sm font-bold">Tải xuống</button>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center">
                    <Download className="h-4 w-4 text-indigo-600 mr-3" />
                    <span className="text-sm font-medium">Ghi_chu_buoi_hoc.docx</span>
                  </div>
                  <button className="text-indigo-600 text-sm font-bold">Tải xuống</button>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">Tài liệu sẽ được cập nhật sau khi buổi học kết thúc.</p>
            )}
          </div>

          {/* Notes / Recording */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 text-indigo-600 mr-2" /> Ghi chú & Ghi hình
            </h3>
            {isPast ? (
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-sm text-amber-800">
                    <span className="font-bold">Ghi chú từ gia sư:</span> Học viên cần ôn lại phần đạo hàm trước buổi sau.
                  </p>
                </div>
                <button className="w-full py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
                  Xem lại ghi hình buổi học
                </button>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">Ghi chú và ghi hình sẽ có sau buổi học.</p>
            )}
          </div>
        </div>

        {/* Support / Contact */}
        <div className="mt-8 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h4 className="font-bold text-slate-900">Cần hỗ trợ?</h4>
            <p className="text-sm text-slate-500">Liên hệ với gia sư hoặc đội ngũ hỗ trợ của TutorLink</p>
          </div>
          <div className="flex gap-3">
            <Link
              to={`/messages`}
              className="px-5 py-2.5 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-all"
            >
              Nhắn tin cho gia sư
            </Link>
            <button className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all">
              Báo cáo vấn đề
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}