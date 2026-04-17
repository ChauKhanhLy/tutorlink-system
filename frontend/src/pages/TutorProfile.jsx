import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  Star,
  ShieldCheck,
  Clock,
  Globe,
  GraduationCap,
  Briefcase,
  MessageSquare,
  Share2,
  Heart,
  ChevronLeft,
  Calendar as CalendarIcon,
  ChevronRight,
  Play,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { tutorApi } from "../api/tutorApi";
import { bookingApi } from "../api/bookingApi";
import { reviewApi } from "../api/reviewApi";
import { ImageWithFallback } from "../components/Image/ImageWithFallback";

export function TutorProfilePage() {
  const { id } = useParams();
  const [tutor, setTutor] = React.useState(null);
  const [availableSlots, setAvailableSlots] = React.useState([]);
  const [selectedDate, setSelectedDate] = React.useState("null");
  const [selectedTime, setSelectedTime] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [reviews, setReviews] = React.useState([]);
  const formatVND = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price || 0) + "đ";
  };
  const selectedDay = availableSlots.find((s) => s.date === selectedDate);

  React.useEffect(() => {
    const fetchTutor = async () => {
      try {
        const res = await tutorApi.getById(id);
        setTutor(res.data);

        // gọi thêm API availability
        const slotRes = await tutorApi.getAvailability(id);
        setAvailableSlots(slotRes.data?.availableSlots || []);

        const reviewRes = await reviewApi.getByTutor(id);
        setReviews(reviewRes.data || []);
      } catch (err) {
        console.error("Lỗi tải gia sư:", err);
        toast.error("Không thể tải thông tin gia sư");
      } finally {
        setLoading(false);
      }
    };
    fetchTutor();
  }, [id]);

  /*const handleBooking = async () => {
    if (!selectedTime) {
      toast.error("Vui lòng chọn giờ");
      return;
    }

    try {
      // Chuyển đổi selectedDate (vd: "15 thg 3, 2026") và selectedTime (vd: "9:00 SA")
      const months = {
        "thg 1": "Jan",
        "thg 2": "Feb",
        "thg 3": "Mar",
        "thg 4": "Apr",
        "thg 5": "May",
        "thg 6": "Jun",
        "thg 7": "Jul",
        "thg 8": "Aug",
        "thg 9": "Sep",
        "thg 10": "Oct",
        "thg 11": "Nov",
        "thg 12": "Dec",
      };
      let dateStr = selectedDate;
      for (const [vn, en] of Object.entries(months)) {
        dateStr = dateStr.replace(vn, en);
      }
      dateStr = dateStr.replace(",", "");
      const baseDate = new Date(dateStr);

      const timeParts = selectedTime.match(/(\d+):(\d+)\s+(SA|CH)/);
      if (!timeParts) throw new Error("Định dạng giờ không hợp lệ");
      let hours = parseInt(timeParts[1]);
      const minutes = parseInt(timeParts[2]);
      const period = timeParts[3];

      if (period === "CH" && hours !== 12) hours += 12;
      if (period === "SA" && hours === 12) hours = 0;

      const startTime = new Date(baseDate);
      startTime.setHours(hours, minutes, 0, 0);
      const endTime = new Date(startTime.getTime() + 50 * 60000); // +50 phút

      await bookingApi.create({
        tutorId: tutor.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        // subject có thể thêm nếu cần
      });

      toast.success("Đặt lịch thành công!");
    } catch (err) {
      console.error("Lỗi đặt lịch:", err);
      toast.error(err.response?.data?.message || "Lỗi đặt lịch");
    }
  };*/
  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Vui lòng chọn ngày và giờ");
      return;
    }

    try {
      const startTime = new Date(`${selectedDate}T${selectedTime}`);
      const endTime = new Date(startTime.getTime() + 50 * 60000);

      await bookingApi.create({
        tutorId: tutor.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      toast.success("Đặt lịch thành công!");
    } catch (err) {
      console.error("Lỗi đặt lịch:", err);
      toast.error(err.response?.data?.message || "Lỗi đặt lịch");
    }
  };

  if (loading) {
    return (
      <div className="pt-32 flex justify-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="pt-32 text-center">
        <h2 className="text-2xl font-bold text-slate-900">
          Không tìm thấy gia sư
        </h2>
        <Link to="/search" className="text-indigo-600 mt-4 inline-block">
          Quay lại tìm kiếm
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to="/search"
          className="inline-flex items-center text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 mr-1" /> Quay lại tìm kiếm
        </Link>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left Column: Profile Details */}
          <div className="lg:col-span-2 space-y-10">
            {/* Header / Intro */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex flex-col md:flex-row gap-8 relative z-10">
                <div className="flex-shrink-0">
                  <div className="relative w-40 h-40 rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-500/10">
                    <ImageWithFallback
                      src={tutor.avatar}
                      alt={tutor.name}
                      className="w-full h-full object-cover"
                    />
                    {tutor.verified && (
                      <div className="absolute bottom-3 right-3 bg-indigo-600 p-1.5 rounded-full shadow-lg border-4 border-white">
                        <ShieldCheck className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
                        {tutor.name}
                      </h1>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500 mr-1.5" />
                          <span className="text-sm font-bold text-slate-900">
                            {tutor.rating || 0}
                          </span>
                          <span className="text-slate-400 text-sm ml-1">
                            ({tutor.reviewCount || 0} đánh giá)
                          </span>
                        </div>
                        <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                        <div className="text-sm font-bold text-indigo-600">
                          Đánh giá cao
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors border border-slate-100">
                        <Heart className="h-5 w-5 text-slate-400" />
                      </button>
                      <button className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors border border-slate-100">
                        <Share2 className="h-5 w-5 text-slate-400" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {tutor.subjects?.map((sub) => (
                      <span
                        key={sub}
                        className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full border border-indigo-100"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-6 py-6 border-t border-slate-50">
                    <div>
                      <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                        Giá
                      </div>
                      <div className="text-xl font-bold text-slate-900">
                        {formatVND(tutor.hourlyRate || tutor.hourly_fee)}
                        <span className="text-sm text-slate-400">/giờ</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                        Ngôn ngữ
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {tutor.languages ? tutor.languages.join(", ") : "Anh"}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                        Kinh nghiệm
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {tutor.lessonsTaught || 120}+ bài học
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-50 rounded-full blur-3xl opacity-30"></div>
            </div>

            {/* About & Credentials */}
            <div className="space-y-8">
              <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  Giới thiệu về tôi
                </h2>
                <p className="text-slate-600 leading-relaxed mb-8">
                  {tutor.bio ||
                    "Tôi là gia sư giàu kinh nghiệm, đam mê giảng dạy và giúp học sinh đạt được mục tiêu học tập."}
                </p>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-amber-50 rounded-2xl">
                      <GraduationCap className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Học vấn</h4>
                      <p className="text-sm text-slate-500">
                        {tutor.education || "Đại học Sư phạm"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-emerald-50 rounded-2xl">
                      <Briefcase className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">
                        Kinh nghiệm chuyên môn
                      </h4>
                      <p className="text-sm text-slate-500">
                        {tutor.experience || "5 năm giảng dạy trực tuyến"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Video Introduction Placeholder */}
              <section className="bg-slate-900 rounded-[2.5rem] p-8 relative overflow-hidden aspect-video flex items-center justify-center">
                <div className="relative z-10 text-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/50 mb-6 mx-auto group"
                  >
                    <Play className="h-8 w-8 text-white fill-white group-hover:scale-110 transition-transform" />
                  </motion.button>
                  <h3 className="text-white text-xl font-bold">
                    Xem video giới thiệu
                  </h3>
                  <p className="text-slate-400 text-sm mt-2">
                    Nghe trực tiếp từ {tutor.name?.split(" ")[0]}
                  </p>
                </div>
                <ImageWithFallback
                  src={tutor.avatar}
                  alt="Video giới thiệu"
                  className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm scale-110"
                />
              </section>

              {/* Reviews */}
              <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-slate-900">
                    Đánh giá của học viên
                  </h2>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-amber-500 fill-amber-500 mr-2" />
                    <span className="text-2xl font-bold text-slate-900">
                      {tutor.rating || 0}
                    </span>
                    <span className="text-slate-400 font-bold ml-2">/ 5.0</span>
                  </div>
                </div>

                <div className="space-y-8">
                  {reviews.length === 0 && (
                    <p className="text-sm text-slate-500">Gia sư chưa có đánh giá nào.</p>
                  )}
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="pb-8 border-b border-slate-100 last:border-none last:pb-0"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                            <ImageWithFallback
                              src={`https://i.pravatar.cc/100?u=${review.reviewerId || review.reviewer_id || review.id}`}
                              alt="Học viên"
                            />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">
                              Học viên
                            </h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              Đánh giá đã xác minh
                            </p>
                          </div>
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3 w-3 ${s <= Number(review.rating) ? "text-amber-500 fill-amber-500" : "text-slate-200 fill-slate-200"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed italic">
                        "{review.comment || "Buổi học hữu ích và chất lượng."}"
                      </p>
                      <div className="mt-4 text-xs font-bold text-slate-400">
                        {review.createdAt
                          ? new Date(review.createdAt).toLocaleDateString("vi-VN")
                          : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* Right Column: Sticky Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <div className="bg-white rounded-[2rem] border-2 border-slate-200 shadow-2xl shadow-indigo-500/10 overflow-hidden">
                <div className="p-8">
                  <div className="flex items-baseline justify-between mb-8">
                    <div className="text-3xl font-extrabold text-slate-900">
                      {formatVND(tutor.hourlyRate || tutor.hourly_fee)}
                    </div>
                    <div className="text-slate-400 text-sm font-bold">
                      Bài học 50 phút
                    </div>
                  </div>

                  {/* Calendar Widget Simplified */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-slate-900">
                        Chọn ngày
                      </h4>
                      <div className="flex space-x-2">
                        <button className="p-1.5 rounded-lg hover:bg-slate-100">
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-slate-100">
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center mb-4">
                      {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
                        <span
                          key={d}
                          className="text-[10px] font-bold text-slate-400 uppercase"
                        >
                          {d}
                        </span>
                      ))}
                      {availableSlots.map((slot) => {
                        const dateObj = new Date(slot.date);
                        const day = dateObj.getDate();

                        return (
                          <button
                            key={slot.date}
                            onClick={() => {
                              setSelectedDate(slot.date);
                              setSelectedTime(null);
                            }}
                            className={`py-2 text-xs font-bold rounded-xl transition-all ${
                              selectedDate === slot.date
                                ? "bg-indigo-600 text-white shadow-lg"
                                : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="mb-10">
                    <h4 className="text-sm font-bold text-slate-900 mb-4">
                      Chọn khung giờ
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedDay?.times?.length > 0 ? (
                        selectedDay.times.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`py-3 text-xs font-bold border rounded-2xl transition-all ${
                              selectedTime === time
                                ? "bg-indigo-50 border-indigo-600 text-indigo-600"
                                : "border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {time}
                          </button>
                        ))
                      ) : (
                        <p className="text-sm text-slate-400">
                          Không có giờ trống
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleBooking}
                    className="w-full py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 mb-4 text-lg"
                  >
                    Xác nhận đặt lịch
                  </button>

                  <Link
                    to="/messages"
                    className="flex items-center justify-center space-x-2 w-full py-4 text-slate-600 font-bold hover:text-indigo-600 transition-colors"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>Gửi tin nhắn</span>
                  </Link>
                </div>

                <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-center space-x-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-500">
                    Đảm bảo hài lòng 100%
                  </span>
                </div>
              </div>

              <div className="mt-8 bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 flex items-start space-x-4">
                <div className="p-2 bg-indigo-600 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-indigo-900 mb-1">
                    Buổi học thử
                  </h4>
                  <p className="text-xs text-indigo-600/70 leading-relaxed font-medium">
                    Mới đến với TutorLink? Buổi học 30 phút đầu tiên của bạn
                    hoàn toàn miễn phí!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
