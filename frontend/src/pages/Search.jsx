import React from "react";
import { Search, Filter, Star, Clock, Globe, ShieldCheck, MapPin, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { tutors } from "../mockData";
import { ImageWithFallback } from "../components/Image/ImageWithFallback";
import { motion } from "framer-motion";

export function SearchPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedSubject, setSelectedSubject] = React.useState("Tất cả môn học");
  //const [priceRange, setPriceRange] = React.useState([0, 100]);

  const subjects = ["Tất cả môn học", "Toán học", "Khoa học", "Khoa học máy tính", "Ngôn ngữ", "Kinh doanh", "Ngữ văn"];

  return (
    <div className="pt-24 pb-16 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Tìm gia sư phù hợp với bạn</h1>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo môn học, kỹ năng hoặc tên gia sư..."
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="md:hidden flex items-center justify-center space-x-2 px-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700">
              <Filter className="h-5 w-5" />
              <span>Bộ lọc</span>
            </button>
          </div>
        </div>

        <div className="flex gap-10">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-28 space-y-8">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-900 flex items-center">
                    <SlidersHorizontal className="h-4 w-4 mr-2" /> Bộ lọc
                  </h3>
                  <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">Đặt lại</button>
                </div>

                {/* Subject Filter */}
                <div className="mb-8">
                  <label className="block text-sm font-bold text-slate-900 mb-3">Môn học</label>
                  <div className="space-y-2">
                    {subjects.map((sub) => (
                      <label key={sub} className="flex items-center group cursor-pointer">
                        <input
                          type="radio"
                          name="subject"
                          checked={selectedSubject === sub}
                          onChange={() => setSelectedSubject(sub)}
                          className="w-5 h-5 border-slate-300 text-indigo-600 focus:ring-indigo-500 rounded-full"
                        />
                        <span className="ml-3 text-sm text-slate-600 group-hover:text-indigo-600 transition-colors">{sub}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div className="mb-8">
                  <label className="block text-sm font-bold text-slate-900 mb-3">Giá mỗi giờ</label>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-4">
                    <span>$0</span>
                    <span>$100+</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {/* Availability */}
                <div className="mb-8">
                  <label className="block text-sm font-bold text-slate-900 mb-3">Thời gian rảnh</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Sáng", "Chiều", "Tối", "Cuối tuần"].map((time) => (
                      <button
                        key={time}
                        className="px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl text-slate-600 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <button className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/10">
                  Áp dụng bộ lọc
                </button>
              </div>

              {/* Promo / Info card */}
              <div className="bg-slate-900 p-6 rounded-3xl text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="font-bold mb-2">Bạn cần một buổi học thử?</h4>
                  <p className="text-slate-400 text-sm mb-4 leading-relaxed">Đặt lịch giới thiệu 30 phút với bất kỳ gia sư nào và được giảm 50%.</p>
                  <button className="text-xs font-bold text-white flex items-center group">
                    Tìm hiểu thêm <ChevronDown className="ml-1 h-3 w-3 -rotate-90 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-indigo-600 rounded-full blur-2xl opacity-40"></div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <p className="text-slate-500 font-medium">
                Hiển thị <span className="text-slate-900 font-bold">{tutors.length}</span> gia sư
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-slate-500 text-sm font-bold">Sắp xếp theo:</span>
                <select className="bg-transparent border-none focus:outline-none font-bold text-slate-900 cursor-pointer">
                  <option>Đề xuất</option>
                  <option>Giá: Thấp đến cao</option>
                  <option>Đánh giá: Cao đến thấp</option>
                  <option>Phổ biến</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              {tutors.map((tutor) => (
                <motion.div
                  key={tutor.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group bg-white rounded-3xl border border-slate-200 p-5 md:p-6 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-100 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Tutor Avatar & Stats */}
                    <div className="flex-shrink-0">
                      <div className="relative w-full md:w-48 h-48 rounded-2xl overflow-hidden mb-4">
                        <ImageWithFallback src={tutor.avatar} alt={tutor.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center shadow-sm">
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500 mr-1" />
                          <span className="text-xs font-bold text-slate-900">{tutor.rating}</span>
                          <span className="text-slate-400 text-[10px] ml-1">({tutor.reviewCount || 0})</span>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center text-slate-500 text-xs font-medium">
                          <Clock className="h-3.5 w-3.5 mr-2 text-indigo-500" />
                          {tutor.lessonsTaught || 124} bài học đã dạy
                        </div>
                        <div className="flex items-center text-slate-500 text-xs font-medium">
                          <Globe className="h-3.5 w-3.5 mr-2 text-indigo-500" />
                          Ngôn ngữ: {tutor.languages ? tutor.languages.join(", ") : "Anh, Việt"}
                        </div>
                      </div>
                    </div>

                    {/* Tutor Info */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex flex-col md:flex-row justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-bold text-slate-900">{tutor.name}</h2>
                            {tutor.verified && <ShieldCheck className="h-5 w-5 text-indigo-600" />}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {tutor.subjects.map((sub) => (
                              <span key={sub} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[11px] font-bold rounded-full border border-indigo-100/50">
                                {sub}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 text-right">
                          <div className="text-2xl font-bold text-indigo-600">${tutor.hourlyRate}</div>
                          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Mỗi giờ</div>
                        </div>
                      </div>

                      <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3">
                        {tutor.bio || "Gia sư giàu kinh nghiệm, sẵn sàng hỗ trợ bạn đạt được mục tiêu học tập."}
                      </p>

                      <div className="mt-auto flex flex-col sm:flex-row items-center gap-3">
                        <Link
                          to={`/tutor/${tutor.id}`}
                          className="w-full sm:w-auto flex-1 bg-indigo-600 text-white font-bold py-3.5 rounded-2xl hover:bg-indigo-700 transition-all text-center shadow-lg shadow-indigo-500/10"
                        >
                          Đặt buổi học thử
                        </Link>
                        <Link
                          to={`/tutor/${tutor.id}`}
                          className="w-full sm:w-auto px-8 py-3.5 border-2 border-slate-100 font-bold text-slate-700 rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all text-center"
                        >
                          Xem hồ sơ
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex justify-center">
              <nav className="flex items-center space-x-2">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                      n === 1 ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-white text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}