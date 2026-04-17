import React from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Star,
  ShieldCheck,
  Clock,
  Users,
  ChevronRight,
  PlayCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { tutorApi } from "../api/tutorApi";
import { ImageWithFallback } from "../components/Image/ImageWithFallback";

export function LandingPage() {
  const [tutors, setTutors] = React.useState([]);
  const categories = [
    "Toán học",
    "Khoa học",
    "Khoa học máy tính",
    "Ngôn ngữ",
    "Kinh doanh",
    "Nhân văn",
    "Luyện thi",
    "Thiết kế",
  ];
  const formatVND = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };
  /*
  React.useEffect(() => {
    tutorApi.getAll().then((res) => setTutors(res.data));
  }, []);
  */

  React.useEffect(() => {
    tutorApi.getAll().then((res) => {
      setTutors(res.data?.tutors || []);
    });
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center min-h-[700px]">
        {/* Hero Background */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1544002176-eacb96b939c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwbGlicmFyeSUyMHN0dWRlbnQlMjBzdHVkeWluZyUyMG1vZGVybiUyMGNsZWFufGVufDF8fHx8MTc3MzIxOTQ5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Thư viện Đại học"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-indigo-600/20 border border-indigo-400/30 text-indigo-300 text-sm font-semibold mb-6">
              Thúc đẩy thành công học tập
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.1] mb-6">
              Tìm <span className="text-indigo-400">Gia sư</span> hoàn hảo cho
              hành trình của bạn.
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed">
              Kết nối với các sinh viên và giảng viên giàu kinh nghiệm để nhận
              sự hướng dẫn 1-1 cá nhân hóa. Thành thạo bất kỳ môn học nào, bất
              kỳ lúc nào.
            </p>

            {/* Hero Search Box */}
            <div className="bg-white p-2 rounded-2xl shadow-2xl max-w-xl flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center px-4 py-3 bg-slate-50 rounded-xl">
                <Search className="h-5 w-5 text-slate-400 mr-3" />
                <input
                  type="text"
                  placeholder="Bạn cần hỗ trợ môn học nào?"
                  className="bg-transparent border-none focus:outline-none w-full text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <Link
                to="/search"
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all text-center"
              >
                Tìm gia sư
              </Link>
            </div>

            <div className="mt-8 flex items-center space-x-6 text-white/80">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700 overflow-hidden"
                  >
                    <ImageWithFallback
                      src={`https://i.pravatar.cc/150?u=${i}`}
                      alt="người dùng"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium">
                Hơn 10.000 học viên đã tham gia trong học kỳ này
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Khám phá theo chủ đề
              </h2>
              <p className="text-slate-500 max-w-lg">
                Khám phá đa dạng các môn học và kỹ năng chuyên môn.
              </p>
            </div>
            <Link
              to="/search"
              className="hidden md:flex items-center text-indigo-600 font-bold hover:underline"
            >
              Xem tất cả <ChevronRight className="ml-1 h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat}
                to={`/search?subject=${encodeURIComponent(cat)}`}
                className="group p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-600 font-bold text-xs">
                      {cat[0]}
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-slate-900">{cat}</h3>
                <p className="text-xs text-slate-400 mt-1">100+ gia sư</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              TutorLink hoạt động như thế nào?
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Làm chủ môn học mới chỉ với ba bước đơn giản.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: "Tìm gia sư của bạn",
                desc: "Lựa chọn từ các gia sư đã được xác thực dựa trên đánh giá, nhận xét và chuyên môn.",
                icon: Search,
                color: "bg-blue-100 text-blue-600",
              },
              {
                title: "Đặt lịch học",
                desc: "Chọn thời gian phù hợp với bạn từ lịch trực tiếp của gia sư.",
                icon: Clock,
                color: "bg-indigo-100 text-indigo-600",
              },
              {
                title: "Bắt đầu học",
                desc: "Tham gia lớp học trực tuyến qua phòng học tích hợp hoặc nền tảng yêu thích.",
                icon: PlayCircle,
                color: "bg-purple-100 text-purple-600",
              },
            ].map((step, idx) => (
              <div key={idx} className="relative text-center">
                <div
                  className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm`}
                >
                  <step.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-slate-500 leading-relaxed">{step.desc}</p>
                {idx < 2 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+4rem)] w-[calc(100%-8rem)] h-[2px] bg-slate-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tutors */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Gia sư được đánh giá cao nhất
              </h2>
              <p className="text-slate-500 max-w-lg">
                Những gia sư được đề xuất nhiều nhất trong tháng này.
              </p>
            </div>
            <Link
              to="/search"
              className="flex items-center text-indigo-600 font-bold hover:underline"
            >
              Xem tất cả gia sư <ChevronRight className="ml-1 h-5 w-5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {tutors.map((tutor) => (
              <div
                key={tutor.id}
                className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500"
              >
                <div className="relative h-48">
                  <ImageWithFallback
                    src={tutor.avatar}
                    alt={tutor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center shadow-sm">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500 mr-1" />
                    <span className="text-sm font-bold text-slate-900">
                      {tutor.rating}
                    </span>
                  </div>
                  {tutor.verified && (
                    <div className="absolute top-4 right-4 bg-indigo-600 p-1.5 rounded-full shadow-lg">
                      <ShieldCheck className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    {tutor.name}
                  </h3>

                  <p className="text-slate-500 text-sm mb-4 line-clamp-1">
                    {Array.isArray(tutor.subjects)
                      ? tutor.subjects.join(", ")
                      : tutor.subject || "Chưa cập nhật môn học"}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div>
                      <span className="text-2xl font-bold text-indigo-600">
                        {formatVND(tutor.hourlyRate || tutor.hourly_fee || 0)}
                      </span>
                      <span className="text-slate-400 text-sm"> / giờ</span>
                    </div>
                    <Link
                      to={`/tutor/${tutor.id}`}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"
                    >
                      Xem hồ sơ
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-indigo-600 rounded-[40px] p-12 md:p-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>

            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
                Sẵn sàng để tiến bộ trong học tập?
              </h2>
              <p className="text-indigo-100 text-lg mb-12">
                Tham gia cùng hàng ngàn học viên đã cải thiện điểm số và sự tự
                tin với TutorLink.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/signup"
                  className="w-full sm:w-auto px-10 py-4 bg-white text-indigo-600 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all shadow-xl"
                >
                  Bắt đầu miễn phí
                </Link>
                <Link
                  to="/search"
                  className="w-full sm:w-auto px-10 py-4 border-2 border-indigo-400 text-white rounded-2xl font-bold text-lg hover:bg-indigo-500 transition-all"
                >
                  Tìm gia sư
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
