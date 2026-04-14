// src/pages/Review.jsx
import React from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Star, Send, ChevronLeft, User, Calendar, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { tutorApi } from "../api/tutorApi";
import { bookingApi } from "../api/bookingApi";
import { ImageWithFallback } from "../components/Image/ImageWithFallback";

export function ReviewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tutorId = searchParams.get("tutorId");
  const bookingId = searchParams.get("bookingId");

  const [tutor, setTutor] = React.useState(null);
  const [booking, setBooking] = React.useState(null);
  const [rating, setRating] = React.useState(0);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [reviewText, setReviewText] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    if (!tutorId) {
      navigate("/dashboard");
      return;
    }
    try {
      const [tutorRes, bookingsRes] = await Promise.all([
        tutorApi.getById(tutorId),
        bookingApi.getMyBookings(),
      ]);
      setTutor(tutorRes.data);
      if (bookingId) {
        const foundBooking = bookingsRes.data.find(b => b.id === bookingId);
        setBooking(foundBooking);
      }
    } catch  {
      toast.error("Không thể tải thông tin");
    } finally {
      setLoading(false);
    }
  }, [tutorId, bookingId, navigate]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá");
      return;
    }
    if (reviewText.trim().length < 10) {
      toast.error("Vui lòng viết đánh giá chi tiết hơn (tối thiểu 10 ký tự)");
      return;
    }

    setSubmitting(true);
    try {
      // Gọi API gửi đánh giá
      // await reviewApi.create({ tutorId, bookingId, rating, content: reviewText });
      toast.success("Cảm ơn bạn đã đánh giá! Đánh giá của bạn sẽ được hiển thị sau khi kiểm duyệt.");
      navigate("/dashboard");
    } catch  {
      toast.error("Gửi đánh giá thất bại, vui lòng thử lại");
    } finally {
      setSubmitting(false);
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
        <h2 className="text-2xl font-bold text-slate-900">Không tìm thấy gia sư</h2>
        <Link to="/dashboard" className="text-indigo-600 mt-4 inline-block">Quay lại Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="inline-flex items-center text-slate-500 hover:text-indigo-600 font-bold mb-6">
          <ChevronLeft className="h-5 w-5 mr-1" /> Quay lại
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 p-8 text-white">
            <h1 className="text-2xl font-bold mb-2">Đánh giá buổi học</h1>
            <p className="text-indigo-100">Chia sẻ trải nghiệm của bạn với gia sư để giúp cộng đồng</p>
          </div>

          {/* Tutor Info */}
          <div className="p-8 border-b border-slate-100">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100">
                <ImageWithFallback src={tutor.avatar} alt={tutor.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{tutor.name}</h2>
                <p className="text-slate-500 text-sm">{tutor.subjects?.join(", ")}</p>
                {booking && (
                  <div className="flex items-center text-xs text-slate-400 mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{new Date(booking.date).toLocaleDateString("vi-VN")}</span>
                    <span className="mx-2">•</span>
                    <span>{booking.time}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rating Stars */}
          <div className="p-8 border-b border-slate-100">
            <label className="block text-sm font-bold text-slate-700 mb-4">Đánh giá của bạn</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 ${
                      star <= (hoverRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-200 fill-slate-200"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-3">
              {rating === 1 && "Rất tệ"}
              {rating === 2 && "Không hài lòng"}
              {rating === 3 && "Bình thường"}
              {rating === 4 && "Hài lòng"}
              {rating === 5 && "Tuyệt vời!"}
            </p>
          </div>

          {/* Review Text */}
          <div className="p-8 border-b border-slate-100">
            <label className="block text-sm font-bold text-slate-700 mb-2">Nhận xét chi tiết</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={6}
              placeholder="Hãy chia sẻ về phương pháp giảng dạy, sự nhiệt tình, kiến thức chuyên môn của gia sư..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
            <p className="text-right text-xs text-slate-400 mt-1">{reviewText.length}/500 ký tự</p>
          </div>

          {/* Tips */}
          <div className="p-8 bg-slate-50">
            <div className="flex items-start gap-3 text-sm text-slate-600">
              <MessageSquare className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-700">Mẹo viết đánh giá hữu ích:</p>
                <ul className="list-disc list-inside mt-1 space-y-1 text-slate-500">
                  <li>Mô tả cụ thể những gì bạn đã học được</li>
                  <li>Đề cập đến điểm mạnh của gia sư (kiến thức, cách truyền đạt, sự kiên nhẫn...)</li>
                  <li>Chia sẻ kết quả học tập sau buổi học</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="p-8 pt-0">
            <button
              onClick={handleSubmitReview}
              disabled={submitting}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="h-5 w-5" /> Gửi đánh giá
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-4">
              Đánh giá của bạn sẽ được kiểm duyệt trước khi hiển thị công khai
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}