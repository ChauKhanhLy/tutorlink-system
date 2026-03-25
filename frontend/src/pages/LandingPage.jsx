import { Link } from "react-router-dom";
import { Search, Clock, PlayCircle } from "lucide-react";

export default function LandingPage() {
  const categories = [
    "Toán học", "Khoa học", "CNTT", "Ngôn ngữ",
    "Kinh doanh", "Xã hội", "Luyện thi", "Thiết kế"
  ];

  return (
    <div className="overflow-hidden">

      {/* HERO */}
      <section className="relative h-screen flex items-center min-h-[700px]">

        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1544002176-eacb96b939c9"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-white">
          <span className="bg-blue-500/20 px-4 py-1 rounded-full text-sm">
            Học tập hiệu quả
          </span>

          <h1 className="text-5xl font-bold mt-6 mb-6">
            Tìm gia sư <span className="text-blue-400">phù hợp</span> cho bạn
          </h1>

          <p className="text-gray-300 mb-8 max-w-xl">
            Kết nối với gia sư chất lượng, học 1-1 hiệu quả mọi lúc mọi nơi.
          </p>

          {/* Search */}
          <div className="bg-white p-2 rounded-xl flex max-w-xl">
            <div className="flex items-center px-3 flex-1">
              <Search className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Bạn cần học môn gì?"
                className="outline-none w-full text-black"
              />
            </div>

            <Link
              to="/search"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Tìm gia sư
            </Link>
          </div>
        </div>
      </section>

      {/* SUBJECT */}
      <section className="py-20 bg-white px-6">
        <h2 className="text-3xl font-bold mb-6">Danh mục môn học</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <div key={i} className="p-6 bg-gray-50 rounded-xl hover:shadow">
              <h3 className="font-semibold">{cat}</h3>
              <p className="text-gray-400 text-sm">100+ gia sư</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-gray-50 text-center">
        <h2 className="text-3xl font-bold mb-10">
          TutorLink hoạt động như thế nào?
        </h2>

        <div className="grid md:grid-cols-3 gap-10 px-6">
          <div>
            <Search className="mx-auto mb-4 text-blue-500" size={40} />
            <h3 className="font-semibold mb-2">Tìm gia sư</h3>
            <p className="text-gray-500">
              Chọn gia sư phù hợp dựa trên đánh giá
            </p>
          </div>

          <div>
            <Clock className="mx-auto mb-4 text-indigo-500" size={40} />
            <h3 className="font-semibold mb-2">Đặt lịch học</h3>
            <p className="text-gray-500">
              Chọn thời gian phù hợp
            </p>
          </div>

          <div>
            <PlayCircle className="mx-auto mb-4 text-purple-500" size={40} />
            <h3 className="font-semibold mb-2">Bắt đầu học</h3>
            <p className="text-gray-500">
              Tham gia lớp học online
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}