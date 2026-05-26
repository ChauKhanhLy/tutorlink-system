import React from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { 
  BookOpen, 
  User, 
  Calendar, 
  Clock, 
  Video, 
  Star, 
  MessageSquare, 
  FileText, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  PlayCircle,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { bookingApi } from "../api/bookingApi";
import { tutorApi } from "../api/tutorApi";
import { reviewApi } from "../api/reviewApi";
import { subjectApi } from "../api/subjectApi";
import { ImageWithFallback } from "../components/Image/ImageWithFallback";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export function ClassroomPage() {
  const { tutorId, subjectId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [tutor, setTutor] = React.useState(null);
  const [subject, setSubject] = React.useState(null);
  const [bookings, setBookings] = React.useState([]);
  const [reviews, setReviews] = React.useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tutorRes, subjectRes, bookingRes, reviewRes] = await Promise.all([
          tutorApi.getById(tutorId),
          subjectApi.getById(subjectId),
          bookingApi.getMyBookings(),
          reviewApi.getByTutor(tutorId)
        ]);

        setTutor(tutorRes.data);
        setSubject(subjectRes.data?.data || subjectRes.data);
        
        // Lọc các booking cho cặp Tutor-Subject này
        const allBookings = bookingRes.data || [];
        const filteredBookings = allBookings.filter(b => {
          const bTutorId = String(b.tutor_id || b.tutorId || "").toLowerCase();
          const bSubId = String(b.subject_id || b.subjectId || "").toLowerCase();
          const pTutorId = String(tutorId || "").toLowerCase();
          const pSubId = String(subjectId || "").toLowerCase();
          return bTutorId === pTutorId && bSubId === pSubId;
        }).sort((a, b) => {
          const dateA = new Date(a.datetime || a.date || 0);
          const dateB = new Date(b.datetime || b.date || 0);
          return dateB - dateA;
        });
        
        setBookings(filteredBookings);
        setReviews(reviewRes.data || []);
      } catch (err) {
        console.error("Lỗi tải lớp học:", err);
        toast.error("Không thể tải thông tin lớp học");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tutorId, subjectId]);

  if (loading) {
    return (
      <div className="pt-32 flex justify-center items-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!tutor || !subject) {
    return (
      <div className="pt-32 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Không tìm thấy thông tin lớp học</h2>
        <Link to="/dashboard" className="text-indigo-600 mt-4 inline-block">Quay lại Dashboard</Link>
      </div>
    );
  }

  const nextBooking = bookings.find(b => new Date(b.datetime || b.date) > new Date());
  const pastBookings = bookings.filter(b => new Date(b.datetime || b.date) <= new Date());

  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Navigation */}
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-slate-500 hover:text-indigo-600 font-bold transition-all group">
            <ChevronLeft className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" /> 
            Quay lại Dashboard
          </Link>
        </div>

        {/* Classroom Header */}
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden mb-10">
          <div className="bg-indigo-600 px-8 py-12 text-white relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center p-4">
                  <BookOpen className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold mb-2 uppercase tracking-tight">
                    {subject.name}
                  </h1>
                  <div className="flex items-center gap-4 text-indigo-100 font-medium">
                     <span className="flex items-center"><User className="h-4 w-4 mr-1.5" /> Gia sư: {tutor.name}</span>
                     <span className="w-1 h-1 bg-white/40 rounded-full"></span>
                     <span>{bookings.length} buổi học đã đăng ký</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                 <Link 
                   to={`/messages?tutorId=${tutor.id}`}
                   className="px-6 py-3 bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold rounded-2xl hover:bg-white/30 transition-all flex items-center"
                 >
                   <MessageSquare className="h-5 w-5 mr-2" /> Nhắn tin
                 </Link>
                 <button className="p-3 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-2xl hover:bg-white/30 transition-all">
                    <ShieldCheck className="h-6 w-6" />
                 </button>
              </div>
            </div>
            {/* Background patterns */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-60 h-60 bg-white/5 rounded-full blur-3xl"></div>
          </div>

          {/* Quick Stats Toolbar */}
          <div className="px-10 py-6 border-b border-slate-100 flex flex-wrap items-center gap-8 bg-white">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                   <Star className="h-5 w-5" />
                </div>
                <div>
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đánh giá chung</div>
                   <div className="font-bold text-slate-900">{Number(tutor.rating || 5).toFixed(1)}/5.0</div>
                </div>
             </div>
             <div className="w-px h-8 bg-slate-100 hidden sm:block"></div>
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                   <Clock className="h-5 w-5" />
                </div>
                <div>
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thời lượng</div>
                   <div className="font-bold text-slate-900">50 phút / buổi</div>
                </div>
             </div>
             <div className="w-px h-8 bg-slate-100 hidden sm:block"></div>
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                   <Calendar className="h-5 w-5" />
                </div>
                <div>
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tần suất</div>
                   <div className="font-bold text-slate-900">2 buổi / tuần</div>
                </div>
             </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left Column: Sessions List */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <Video className="h-6 w-6 mr-3 text-indigo-600" />
                Link các buổi học (Tất cả)
              </h2>
              
              <div className="space-y-4">
                {bookings.length > 0 ? (
                  bookings.map((booking, idx) => {
                    const isUpcoming = new Date(booking.datetime || booking.date) > new Date();
                    return (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-6 rounded-3xl border border-slate-200 transition-all flex flex-col md:flex-row justify-between items-center gap-4 ${
                          isUpcoming ? "bg-white shadow-lg border-indigo-100" : "bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
                            isUpcoming ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"
                          }`}>
                            {bookings.length - idx}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                               <Calendar className="h-3.5 w-3.5 text-slate-400" />
                               <span className="text-sm font-bold text-slate-700">
                                 {new Date(booking.datetime || booking.date).toLocaleDateString("vi-VN", { 
                                   weekday: 'short', day: 'numeric', month: 'numeric' 
                                 })}
                               </span>
                               <span className="mx-1.5 text-slate-300">•</span>
                               <Clock className="h-3.5 w-3.5 text-slate-400" />
                               <span className="text-sm font-bold text-slate-700">{booking.time}</span>
                            </div>
                            <h4 className={`font-bold ${isUpcoming ? "text-indigo-600" : "text-slate-500"}`}>
                              Buổi học {isUpcoming ? "sắp diễn ra" : "đã kết thúc"}
                            </h4>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                           {isUpcoming ? (
                             <Link 
                               to={`/room/${booking.room_id || booking.id}`}
                               className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md flex items-center"
                             >
                               Vào phòng học <ArrowRight className="ml-2 h-4 w-4" />
                             </Link>
                           ) : (
                             <button className="px-6 py-2.5 bg-white border border-slate-100 text-slate-400 text-sm font-bold rounded-xl cursor-not-allowed flex items-center">
                                Xem lại <PlayCircle className="ml-2 h-4 w-4" />
                             </button>
                           )}
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                     <p className="text-slate-400 font-bold italic">Chưa có lịch buổi học nào</p>
                  </div>
                )}
              </div>
            </section>

            {/* Review Section */}
            <section className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm">
               <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">Review & Đánh giá</h2>
                  <div className="flex items-center">
                     <Star className="h-5 w-5 text-amber-500 fill-amber-500 mr-2" />
                     <span className="text-2xl font-bold text-slate-900">{Number(tutor.rating || 0).toFixed(1)}</span>
                     <span className="text-slate-400 font-bold ml-1">/ 5.0</span>
                  </div>
               </div>
               
               <div className="space-y-8">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="pb-8 border-b border-slate-50 last:border-none last:pb-0">
                         <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 overflow-hidden">
                                  <ImageWithFallback src={`https://i.pravatar.cc/100?u=${review.id}`} alt="Reviewer" />
                               </div>
                               <div>
                                  <h4 className="text-sm font-bold text-slate-900">Học viên ẩn danh</h4>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">Đã xác thực</p>
                               </div>
                            </div>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} className={`h-3 w-3 ${s <= review.rating ? "text-amber-500 fill-amber-500" : "text-slate-200"}`} />
                              ))}
                            </div>
                         </div>
                         <p className="text-slate-600 text-sm leading-relaxed italic">"{review.comment}"</p>
                         <div className="mt-4 text-[10px] font-bold text-slate-400">
                            {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                         </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-400 py-10 font-medium">Gia sư chưa có lượt đánh giá nào.</p>
                  )}
               </div>
            </section>
          </div>

          {/* Right Column: Tutor Summary Card */}
          <div className="lg:col-span-1">
             <div className="sticky top-28 space-y-6">
                <div className="bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-xl overflow-hidden">
                   <div className="p-8">
                      <div className="flex flex-col items-center mb-6">
                         <div className="relative mb-6">
                            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl">
                               <ImageWithFallback src={tutor.avatar} alt={tutor.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute bottom-2 right-2 p-1.5 bg-emerald-500 rounded-full border-4 border-white shadow-lg"></div>
                         </div>
                         <h3 className="text-2xl font-bold text-slate-900 mb-1">{tutor.name}</h3>
                         <div className="text-sm font-bold text-indigo-600 mb-4">
                           {Array.isArray(tutor.subjects) ? tutor.subjects.join(" • ") : (typeof tutor.subjects === 'string' && tutor.subjects !== '{}' ? tutor.subjects : "")}
                         </div>
                         
                         <p className="text-center text-slate-500 text-sm leading-relaxed mb-6 italic">
                            "{tutor.bio || 'Tôi rất vui được cùng bạn chinh phục kiến thức mới.'}"
                         </p>
                         
                         <div className="w-full grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl text-center">
                               <div className="text-xl font-bold text-slate-900">{tutor.experience || "3+"}</div>
                               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Năm KN</div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl text-center">
                               <div className="text-xl font-bold text-slate-900">{tutor.review_count || 0}</div>
                               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Học viên</div>
                            </div>
                         </div>
                      </div>
                      
                      <Link 
                        to={`/tutor/${tutor.id}`}
                        className="flex items-center justify-center w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all gap-2"
                      >
                         Xem profile chi tiết <ChevronRight className="h-4 w-4" />
                      </Link>
                   </div>
                </div>

                <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex items-start gap-4">
                   <div className="p-2 bg-amber-500 rounded-lg">
                      <ShieldCheck className="h-5 w-5 text-white" />
                   </div>
                   <div>
                      <h4 className="text-sm font-bold text-amber-900 mb-1">Ghi chú từ trung tâm</h4>
                      <p className="text-xs text-amber-900/60 leading-relaxed font-medium">Học viên nên chuẩn bị bài trước buổi học để đạt hiệu quả cao nhất. Liên hệ hỗ trợ nếu link phòng học có vấn đề.</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
