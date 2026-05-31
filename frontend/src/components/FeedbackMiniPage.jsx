import React from "react";
import { AlertTriangle, MessageSquare, Send, Star, X } from "lucide-react";
import { toast } from "sonner";
import { complaintApi } from "../api/complantApi";
import { reviewApi } from "../api/reviewApi";

export function FeedbackMiniPage({
  onClose,
  bookingId,
  targetUserId,
  targetName,
  targetRole = "tutor",
  canReview = false,
  onSubmitted,
}) {
  const [activeTab, setActiveTab] = React.useState(canReview ? "review" : "feedback");
  const [loading, setLoading] = React.useState(false);
  const [rating, setRating] = React.useState(0);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [reviewText, setReviewText] = React.useState("");
  const [feedback, setFeedback] = React.useState({
    type: targetRole === "tutor" ? "teaching_quality" : "communication",
    title: "",
    description: "",
    evidence: "",
  });

  const isTutorTarget = targetRole === "tutor";
  const targetLabel = isTutorTarget ? "gia sư" : "học sinh";
  const reviewLength = reviewText.trim().length;
  const canSubmitReview = rating > 0 && reviewLength >= 10 && reviewText.length <= 500;
  const canSubmitFeedback = feedback.title.trim() && feedback.description.trim();

  const feedbackTypes = isTutorTarget
    ? [
        { value: "teaching_quality", label: "Dạy không cẩn thận / khó hiểu" },
        { value: "late", label: "Vào muộn / vắng không báo trước" },
        { value: "misconduct", label: "Thái độ không phù hợp" },
        { value: "communication", label: "Giao tiếp kém" },
        { value: "other", label: "Vấn đề khác" },
      ]
    : [
        { value: "communication", label: "Giao tiếp kém" },
        { value: "late", label: "Vào muộn / vắng không báo trước" },
        { value: "misconduct", label: "Thái độ không phù hợp" },
        { value: "payment", label: "Vấn đề thanh toán" },
        { value: "other", label: "Vấn đề khác" },
      ];

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    if (!canSubmitReview) {
      toast.error("Vui lòng chọn số sao và viết nhận xét tối thiểu 10 ký tự");
      return;
    }

    setLoading(true);
    try {
      await reviewApi.create({
        bookingId,
        rating,
        comment: reviewText.trim(),
      });
      toast.success("Đã gửi đánh giá");
      onSubmitted?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gửi đánh giá thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (event) => {
    event.preventDefault();
    if (!canSubmitFeedback) {
      toast.error("Vui lòng nhập tiêu đề và nội dung phản hồi");
      return;
    }

    setLoading(true);
    try {
      await complaintApi.create({
        reported_id: targetUserId,
        booking_id: bookingId,
        type: feedback.type,
        title: feedback.title.trim(),
        description: feedback.description.trim(),
        evidence: feedback.evidence.trim(),
      });
      toast.success("Đã gửi phản hồi. Admin sẽ xem xét.");
      onSubmitted?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gửi phản hồi thất bại");
    } finally {
      setLoading(false);
    }
  };

  const updateFeedback = (event) => {
    setFeedback((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <MessageSquare className="h-5 w-5" />
              <h2 className="text-xl font-extrabold text-slate-900">Phản hồi buổi học</h2>
            </div>
            <p className="text-sm text-slate-500">
              Gửi nội dung về {targetLabel}
              {targetName ? ` ${targetName}` : ""} ngay tai day.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-9 h-9 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center disabled:opacity-50"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pt-4 flex gap-2 border-b border-slate-100">
          {canReview && (
            <button
              type="button"
              onClick={() => setActiveTab("review")}
              className={`px-4 py-2 rounded-t-xl text-sm font-bold transition ${
                activeTab === "review"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              Đánh giá sao
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab("feedback")}
            className={`px-4 py-2 rounded-t-xl text-sm font-bold transition ${
              activeTab === "feedback"
                ? "bg-red-600 text-white"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Phản hồi vấn đề
          </button>
        </div>

        <div className="overflow-y-auto">
          {activeTab === "review" && (
            <form onSubmit={handleSubmitReview} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Mức độ hài lòng
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-9 w-9 ${
                          star <= (hoverRating || rating)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-200 text-slate-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nhận xét chi tiết
                </label>
                <textarea
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  rows={5}
                  maxLength={500}
                  placeholder="Ví dụ: Gia sư dạy cẩn thận, giải dễ hiểu, hoặc cần cải thiện điểm nào..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                <p className={`text-xs mt-1 ${reviewLength > 0 && reviewLength < 10 ? "text-red-500" : "text-slate-400"}`}>
                  Tối thiểu 10 ký tự, tối đa 500 ký tự.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!canSubmitReview || loading}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {loading ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "feedback" && (
            <form onSubmit={handleSubmitFeedback} className="p-6 space-y-4">
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-sm text-red-700">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p>
                  Dùng mục này khi cần báo admin xem xét, ví dụ {isTutorTarget ? "gia sư dạy không cẩn thận" : "học sinh có thái độ không phù hợp"}.
                </p>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Người được phản hồi</label>
                <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700">
                  {targetName || targetLabel}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Loại vấn đề</label>
                <select
                  name="type"
                  value={feedback.type}
                  onChange={updateFeedback}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {feedbackTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Tiêu đề</label>
                <input
                  name="title"
                  value={feedback.title}
                  onChange={updateFeedback}
                  placeholder="Tóm tắt vấn đề"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Nội dung phản hồi</label>
                <textarea
                  name="description"
                  rows={5}
                  value={feedback.description}
                  onChange={updateFeedback}
                  placeholder="Mô tả rõ thời gian, hành vi, ảnh hưởng và mong muốn xử lý..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Bằng chứng (link nếu có)</label>
                <input
                  name="evidence"
                  value={feedback.evidence}
                  onChange={updateFeedback}
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!canSubmitFeedback || loading}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {loading ? "Đang gửi..." : "Gửi phản hồi"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
