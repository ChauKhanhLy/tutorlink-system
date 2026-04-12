import React from "react";
import { Link } from "react-router-dom";
import { Search, Clock, PlayCircle, Star, ShieldCheck } from "lucide-react";
import { MotionContext } from "framer-motion";
import { tutors } from "../mockData";
import { ImageWithFallback } from "../components/Image/ImageWithFallback";

export default function LandingPage() {
  const categories = [
    "Toán học", "Khoa học", "Khoa học máy tính", "Ngôn ngữ",
    "Kinh doanh", "Nhân văn", "Luyện thi", "Thiết kế"
  ];

  return (
    <div className="overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center min-h-[700px]">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1544002176-eacb96b939c9"
            alt="Học tập"
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
              Học tập hiệu quả
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.1] mb-6">
              Tìm gia sư <span className="text-indigo-400">phù hợp</span> cho bạn
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed">
              Kết nối với gia sư chất lượng, học 1-1 hiệu quả mọi lúc mọi nơi.
            </p>

            {/* Search Box */}
            <div className="bg-white p-2 rounded-2xl shadow-2xl max-w-xl flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center px-4 py-3 bg-slate-50 rounded-xl">
                <Search className="h-5 w-5 text-slate-400 mr-3" />
                <input
                  type="text"
                  placeholder="Bạn cần học môn gì?"
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
          </motion.div>
        </div>
      </section>

      {/* SUBJECT CATEGORIES */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Danh mục môn học</h2>
              <p className="text-slate-500 max-w-lg">
                Khám phá đa dạng các môn học và kỹ năng chuyên môn.
              </p>
            </div>
            <Link to="/search" className="hidden md:flex items-center text-indigo-600 font-bold hover:underline">
              Xem tất cả
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                to={`/search?subject=${encodeURIComponent(cat)}`}
                className="group p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-100 hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-indigo-600 font-bold text-lg">{cat[0]}</span>
                </div>
                <h3 className="font-bold text-slate-900">{cat}</h3>
                <p className="text-xs text-slate-400 mt-1">100+ gia sư</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            TutorLink hoạt động như thế nào?
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto mb-16">
            Làm chủ môn học mới chỉ với ba bước đơn giản.
          </p>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { title: "Tìm gia sư", desc: "Chọn gia sư phù hợp dựa trên đánh giá", icon: Search, color: "bg-blue-100 text-blue-600" },
              { title: "Đặt lịch học", desc: "Chọn thời gian phù hợp", icon: Clock, color: "bg-indigo-100 text-indigo-600" },
              { title: "Bắt đầu học", desc: "Tham gia lớp học online", icon: PlayCircle, color: "bg-purple-100 text-purple-600" },
            ].map((step, idx) => (
              <div key={idx} className="relative text-center">
                <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm`}>
                  <step.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED TUTORS (optional, if mockData exists) */}
      {tutors && tutors.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Gia sư nổi bật</h2>
                <p className="text-slate-500 max-w-lg">Những gia sư được đánh giá cao nhất.</p>
              </div>
              <Link to="/search" className="flex items-center text-indigo-600 font-bold hover:underline">
                Xem tất cả
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {tutors.slice(0, 3).map((tutor) => (
                <div key={tutor.id} className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all">
                  <div className="relative h-48">
                    <ImageWithFallback src={tutor.avatar} alt={tutor.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500 mr-1" />
                      <span className="text-sm font-bold text-slate-900">{tutor.rating}</span>
                    </div>
                    {tutor.verified && (
                      <div className="absolute top-4 right-4 bg-indigo-600 p-1.5 rounded-full shadow-lg">
                        <ShieldCheck className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{tutor.name}</h3>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-1">{tutor.subjects.join(", ")}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div>
                        <span className="text-2xl font-bold text-indigo-600">${tutor.hourlyRate}</span>
                        <span className="text-slate-400 text-sm"> / giờ</span>
                      </div>
                      <Link to={`/tutor/${tutor.id}`} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800">
                        Xem hồ sơ
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}