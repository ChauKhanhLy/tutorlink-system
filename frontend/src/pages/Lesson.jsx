// // src/pages/Lesson.jsx
// import React from "react";
// import { useParams, Link } from "react-router-dom";
// import {
//   Video,
//   Clock,
//   Calendar,
//   Download,
//   FileText,
//   MessageSquare,
//   ExternalLink,
//   ChevronLeft,
//   CheckCircle,
//   AlertCircle,
//   Copy,
// } from "lucide-react";
// import { toast } from "sonner";
// import { bookingApi } from "../api/bookingApi";
// import { tutorApi } from "../api/tutorApi";
// import { ImageWithFallback } from "../components/Image/ImageWithFallback";

// export function LessonPage() {
//   const { id } = useParams(); // booking id
//   const [booking, setBooking] = React.useState(null);
//   const [tutor, setTutor] = React.useState(null);
//   const [loading, setLoading] = React.useState(true);
//   const joinLink = booking?.meeting_link || booking?.meetingLink || "https://zoom.us/j/123456789";

//   const fetchLessonDetails = React.useCallback(async () => {
//     try {
//       const bookingRes = await bookingApi.getMyBookings();
//       const foundBooking = bookingRes.data.find((b) => b.id === id);
//       if (foundBooking) {
//         setBooking(foundBooking);
//         const tutorRes = await tutorApi.getById(foundBooking.tutorId);
//         setTutor(tutorRes.data);
//       } else {
//         toast.error("Không tìm thấy thông tin buổi học");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Lỗi tải dữ liệu");
//     } finally {
//       setLoading(false);
//     }
//   }, [id]);

//   React.useEffect(() => {
//     fetchLessonDetails();
//   }, [fetchLessonDetails]);

//   const copyJoinLink = () => {
//     navigator.clipboard.writeText(joinLink);
//     toast.success("Đã sao chép link tham gia");
//   };

//   const isUpcoming = booking && new Date(booking.date || booking.startTime) >= new Date();
//   const isPast = booking && new Date(booking.date || booking.startTime) < new Date();

//   const handleTutorConfirm = async () => {
//   try {
//     await bookingApi.tutorConfirm(id); // gọi API backend
//     toast.success("Đã xác nhận dạy");
//     fetchLessonDetails(); // reload thông tin booking
//   } catch (err) {
//     console.error(err);
//     toast.error("Xác nhận thất bại");
//   }
// };

// const handleLearnerConfirm = async () => {
//   try {
//     await bookingApi.learnerConfirm(id); // gọi API backend
//     toast.success("Đã xác nhận học");
//     fetchLessonDetails();
//   } catch (err) {
//     console.error(err);
//     toast.error("Xác nhận thất bại");
//   }
// };

// const handleViewVideo = async () => {
//   try {
//     const res = await bookingApi.getVideoSessions(id); // API /video-sessions?lesson_session_id=:id
//     if (res.data.length > 0) {
//       window.open(res.data[0].video_url, "_blank");
//     } else {
//       toast.error("Chưa có ghi hình");
//     }
//   } catch (err) {
//     console.error(err);
//     toast.error("Không lấy được video");
//   }
// };

//   if (loading) {
//     return (
//       <div className="pt-32 flex justify-center">
//         <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
//       </div>
//     );
//   }

//   if (!booking) {
//     return (
//       <div className="pt-32 text-center">
//         <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
//         <h2 className="text-2xl font-bold text-slate-900">Không tìm thấy buổi học</h2>
//         <Link to="/dashboard" className="text-indigo-600 mt-4 inline-block">Quay lại Dashboard</Link>
//       </div>
//     );
//   }

//   return (
//     <div className="pt-24 pb-16 bg-slate-50 min-h-screen">
//       <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
//         <Link to="/dashboard" className="inline-flex items-center text-slate-500 hover:text-indigo-600 font-bold mb-6">
//           <ChevronLeft className="h-5 w-5 mr-1" /> Quay lại Dashboard
//         </Link>

//         {/* Header */}
//         <div className="bg-white rounded-3xl border border-slate-200 p-8 mb-8 shadow-sm">
//           <div className="flex flex-col md:flex-row justify-between items-start gap-6">
//             <div className="flex items-center gap-5">
//               <div className="w-20 h-20 rounded-2xl overflow-hidden bg-indigo-100">
//                 <ImageWithFallback src={tutor?.avatar} alt={tutor?.name} className="w-full h-full object-cover" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-extrabold text-slate-900 mb-1">{tutor?.name}</h1>
//                 <p className="text-slate-500">{tutor?.subjects?.join(", ")}</p>
//                 <div className="flex items-center mt-2 text-sm text-slate-500">
//                   <Calendar className="h-4 w-4 mr-1" />
//                   <span>{new Date(booking.date || booking.startTime).toLocaleDateString("vi-VN")}</span>
//                   <Clock className="h-4 w-4 ml-3 mr-1" />
//                   <span>{booking.time || new Date(booking.startTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
//                 </div>
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               {isUpcoming && (
//                 <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-bold text-sm flex items-center">
//                   <CheckCircle className="h-4 w-4 mr-1" /> Sắp diễn ra
//                 </span>
//               )}
//               {isPast && (
//                 <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm">Đã kết thúc</span>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Join Section (if upcoming) */}
//         {isUpcoming && (
//           <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-3xl p-8 text-white mb-8 shadow-xl">
//             <div className="flex flex-col md:flex-row justify-between items-center gap-6">
//               <div>
//                 <div className="flex items-center gap-2 mb-3">
//                   <Video className="h-6 w-6" />
//                   <span className="font-bold uppercase tracking-wider text-sm">Phòng học trực tuyến</span>
//                 </div>
//                 <h2 className="text-2xl font-bold mb-2">Buổi học sắp bắt đầu</h2>
//                 <p className="text-indigo-100 mb-4">Nhấn nút bên dưới để tham gia phòng học Zoom/Google Meet</p>
//                 <div className="flex flex-wrap gap-3">
//                   <a
//                     href={joinLink}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-slate-100 transition-all"
//                   >
//                     Tham gia ngay <ExternalLink className="ml-2 h-4 w-4" />
//                   </a>

//                   //Thêm nút đã dạy/đã học
//                   {booking && !booking.tutor_confirmed && (
//                     <button
//                       onClick={handleTutorConfirm}
//                       className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-all"
//                     >
//                       Đã dạy
//                     </button>
//                   )}

//                   {booking && booking.tutor_confirmed && !booking.learner_confirmed && (
//                     <button
//                       onClick={handleLearnerConfirm}
//                       className="px-6 py-3 bg-indigo-500 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all"
//                     >
//                       Đã học
//                     </button>
//                   )}
//                   // Đến đây

//                   <button
//                     onClick={copyJoinLink}
//                     className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur border border-white/30 text-white font-bold rounded-2xl hover:bg-white/30 transition-all"
//                   >
//                     <Copy className="h-4 w-4 mr-2" /> Sao chép link
//                   </button>
//                 </div>
//               </div>
//               <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
//                 <Video className="h-12 w-12" />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Lesson Materials / Notes */}
//         <div className="grid md:grid-cols-2 gap-8">
//           {/* Materials */}
//           <div className="bg-white rounded-3xl border border-slate-200 p-6">
//             <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
//               <FileText className="h-5 w-5 text-indigo-600 mr-2" /> Tài liệu buổi học
//             </h3>
//             {isPast ? (
//               <div className="space-y-3">
//                 <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
//                   <div className="flex items-center">
//                     <Download className="h-4 w-4 text-indigo-600 mr-3" />
//                     <span className="text-sm font-medium">Bai_tap_chuong_3.pdf</span>
//                   </div>
//                   <button className="text-indigo-600 text-sm font-bold">Tải xuống</button>
//                 </div>
//                 <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
//                   <div className="flex items-center">
//                     <Download className="h-4 w-4 text-indigo-600 mr-3" />
//                     <span className="text-sm font-medium">Ghi_chu_buoi_hoc.docx</span>
//                   </div>
//                   <button className="text-indigo-600 text-sm font-bold">Tải xuống</button>
//                 </div>
//               </div>
//             ) : (
//               <p className="text-slate-500 text-sm">Tài liệu sẽ được cập nhật sau khi buổi học kết thúc.</p>
//             )}
//           </div>

//           {/* Notes / Recording */}
//           <div className="bg-white rounded-3xl border border-slate-200 p-6">
//             <button
//               onClick={handleViewVideo}
//               className="w-full py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
//             >
//               Xem lại ghi hình buổi học
//             </button>
//             {isPast ? (
//               <div className="space-y-3">
//                 <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
//                   <p className="text-sm text-amber-800">
//                     <span className="font-bold">Ghi chú từ gia sư:</span> Học viên cần ôn lại phần đạo hàm trước buổi sau.
//                   </p>
//                 </div>
//                 <button className="w-full py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
//                   Xem lại ghi hình buổi học
//                 </button>
//               </div>
//             ) : (
//               <p className="text-slate-500 text-sm">Ghi chú và ghi hình sẽ có sau buổi học.</p>
//             )}
//           </div>
//         </div>

//         {/* Support / Contact */}
//         <div className="mt-8 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
//           <div>
//             <h4 className="font-bold text-slate-900">Cần hỗ trợ?</h4>
//             <p className="text-sm text-slate-500">Liên hệ với gia sư hoặc đội ngũ hỗ trợ của TutorLink</p>
//           </div>
//           <div className="flex gap-3">
//             <Link
//               to={`/messages`}
//               className="px-5 py-2.5 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-all"
//             >
//               Nhắn tin cho gia sư
//             </Link>
//             <button className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all">
//               Báo cáo vấn đề
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/pages/LessonPage.jsx
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
import { videoRoomApi } from "../api/videoRoomApi";
import { ImageWithFallback } from "../components/Image/ImageWithFallback";
import { useAuth } from "../context/AuthContext";

export function LessonPage() {
  const { id } = useParams(); // booking id
  const { user } = useAuth();
  const [booking, setBooking] = React.useState(null);
  const [tutor, setTutor] = React.useState(null);
  const [videoRoom, setVideoRoom] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const joinLink = booking?.meeting_link || booking?.meetingLink || "https://zoom.us/j/123456789";

  // ===== Hàm xác nhận & xem video =====
  const handleTutorConfirm = async () => {
    try {
      await bookingApi.tutorConfirm(id);
      toast.success("Đã xác nhận dạy thành công!");
      fetchLessonDetails();
    } catch (err) {
      console.error(err);
      const errMsg = err?.response?.data?.message || "Xác nhận thất bại";
      toast.error(errMsg);
    }
  };

  const handleLearnerConfirm = async () => {
    try {
      await bookingApi.learnerConfirm(id);
      toast.success("Đã xác nhận học thành công!");
      fetchLessonDetails();
    } catch (err) {
      console.error(err);
      const errMsg = err?.response?.data?.message || "Xác nhận thất bại";
      toast.error(errMsg);
    }
  };

  const handleViewVideo = async () => {
    if (videoRoom?.record_url) {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      window.open(`${backendUrl}${videoRoom.record_url}`, "_blank");
    } else {
      toast.info("Tính năng xem lại ghi hình đang được phát triển hoặc buổi học chưa được ghi hình.");
    }
  };
  // ==========================================

  const fetchLessonDetails = React.useCallback(async () => {
    try {
      // Dùng getById để load thông tin chính xác nhất, bao gồm trạng thái lesson_session
      const bookingRes = await bookingApi.getById(id);
      const foundBooking = bookingRes?.data;
      if (foundBooking) {
        setBooking(foundBooking);
        
        // Load thông tin gia sư
        const tutorRes = await tutorApi.getById(foundBooking.tutorId);
        setTutor(tutorRes.data);

        // Fetch thêm thông tin video room để lấy record_url
        try {
          const roomRes = await videoRoomApi.getRoomByBookingId(foundBooking.id);
          if (roomRes?.data) {
            setVideoRoom(roomRes.data);
          }
        } catch (roomErr) {
          console.warn("Không tìm thấy video room cho booking này:", roomErr);
        }
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
                <ImageWithFallback src={tutor?.avatar} alt={tutor?.name} className="w-full h-full object-cover" />
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
              {booking.attended && (
                <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-bold text-sm flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" /> Đã học
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Confirmation Section (Hiển thị nếu chưa hoàn tất xác nhận cả 2 bên) */}
        {(!booking.tutor_confirmed || !booking.learner_confirmed) && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 mb-8 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2 flex items-center">
                  <CheckCircle className="h-6 w-6 text-indigo-600 mr-2" /> Xác nhận hoàn thành buổi học
                </h3>
                <p className="text-slate-500 text-sm max-w-xl">
                  {user?.role === "tutor"
                    ? "Nhấn 'Đã dạy' sau khi bạn hoàn thành buổi dạy. Hệ thống sẽ gửi yêu cầu xác nhận tới học viên."
                    : "Nhấn 'Đã học' sau khi gia sư đã dạy xong để xác nhận tham gia đầy đủ buổi học."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {user?.role === "tutor" && !booking.tutor_confirmed && (
                  <button
                    onClick={handleTutorConfirm}
                    className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/25"
                  >
                    Đã dạy xong
                  </button>
                )}
                {user?.role !== "tutor" && booking.tutor_confirmed && !booking.learner_confirmed && (
                  <button
                    onClick={handleLearnerConfirm}
                    className="px-6 py-3 bg-indigo-500 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/25"
                  >
                    Đã học xong
                  </button>
                )}
                {user?.role === "tutor" && booking.tutor_confirmed && (
                  <span className="text-emerald-600 font-bold text-sm bg-emerald-50 border border-emerald-100 px-4 py-2.5 rounded-2xl">
                    Đã xác nhận. Đang chờ học viên xác nhận.
                  </span>
                )}
                {user?.role !== "tutor" && !booking.tutor_confirmed && (
                  <span className="text-amber-600 font-bold text-sm bg-amber-50 border border-amber-100 px-4 py-2.5 rounded-2xl">
                    Đang chờ gia sư xác nhận đã dạy...
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

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
          <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <MessageSquare className="h-5 w-5 text-indigo-600 mr-2" /> Ghi chú & Ghi hình
              </h3>
              
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 mb-4">
                <p className="text-sm text-amber-800">
                  <span className="font-bold">Ghi chú từ gia sư:</span> Ôn tập kỹ kiến thức đã học và chuẩn bị bài tập về nhà.
                </p>
              </div>
            </div>

            {videoRoom?.record_url ? (
              <div className="mt-2">
                <p className="text-xs text-slate-500 mb-2 font-medium">Bản ghi hình buổi học trực tuyến:</p>
                <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-md bg-slate-950">
                  <video
                    src={`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}${videoRoom.record_url}`}
                    controls
                    className="w-full aspect-video object-contain"
                    poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"
                  />
                  <div className="p-3 bg-slate-900 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 block animate-pulse"></span>
                      <span>Ghi hình ({videoRoom.duration_minutes || 0} phút)</span>
                    </div>
                    <a
                      href={`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}${videoRoom.record_url}`}
                      download={`buoi-hoc-${id}.webm`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-bold transition"
                    >
                      <Download className="w-3 h-3" /> Tải về
                    </a>
                  </div>
                </div>
              </div>
            ) : isPast ? (
              <div className="space-y-3">
                <button
                  onClick={handleViewVideo}
                  className="w-full py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-400 bg-slate-50 cursor-not-allowed flex items-center justify-center gap-2"
                  disabled
                >
                  <Video className="w-4 h-4 text-slate-400" /> Chưa có video ghi hình
                </button>
                <p className="text-[11px] text-slate-400 text-center">Buổi học này chưa được kích hoạt ghi hình khi diễn ra.</p>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">Ghi chú và ghi hình sẽ khả dụng sau khi buổi học kết thúc.</p>
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