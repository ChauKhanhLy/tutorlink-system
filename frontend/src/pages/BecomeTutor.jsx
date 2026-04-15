import React from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  GraduationCap,
  Briefcase,
  Award,
  BookOpen,
  DollarSign,
  FileText,
  Upload,
  ChevronLeft,
  Clock,
  Globe,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { tutorApi } from "../api/tutorApi";
import { ImageWithFallback } from "../components/Image/ImageWithFallback";

export function BecomeTutorPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [step, setStep] = React.useState(1);
  
  const [formData, setFormData] = React.useState({
    // Thông tin cá nhân (lấy từ user)
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    avatar: user?.avatar || "",
    
    // Thông tin chuyên môn
    subjects: [],
    hourlyRate: "",
    education: "",
    experience: "",
    certifications: "",
    bio: "",
    languages: ["Tiếng Việt"],
    teachingStyle: "",
    availability: [],
    
    // Upload files
    cvFile: null,
    degreeFiles: [],
  });

  const subjectsList = [
    "Toán học",
    "Vật lý",
    "Hóa học",
    "Sinh học",
    "Ngữ văn",
    "Tiếng Anh",
    "Tiếng Nhật",
    "Tiếng Hàn",
    "Tiếng Trung",
    "Lập trình",
    "Khoa học máy tính",
    "Kinh tế",
    "Marketing",
    "Thiết kế đồ họa",
    "Âm nhạc",
  ];

  const languagesList = [
    "Tiếng Việt",
    "Tiếng Anh",
    "Tiếng Nhật",
    "Tiếng Hàn",
    "Tiếng Trung",
    "Tiếng Pháp",
    "Tiếng Đức",
  ];

  const availabilityOptions = [
    { id: "morning", label: "Sáng (8:00 - 12:00)" },
    { id: "afternoon", label: "Chiều (13:00 - 17:00)" },
    { id: "evening", label: "Tối (18:00 - 22:00)" },
    { id: "weekend", label: "Cuối tuần" },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubjectToggle = (subject) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleLanguageToggle = (language) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const handleAvailabilityToggle = (option) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(option)
        ? prev.availability.filter(a => a !== option)
        : [...prev.availability, option]
    }));
  };

  const handleFileChange = (field, files) => {
    setFormData(prev => ({ ...prev, [field]: files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (formData.subjects.length === 0) {
      toast.error("Vui lòng chọn ít nhất một môn học");
      return;
    }
    if (!formData.hourlyRate || formData.hourlyRate < 5) {
      toast.error("Giá mỗi giờ tối thiểu là $5");
      return;
    }
    if (!formData.education) {
      toast.error("Vui lòng nhập thông tin học vấn");
      return;
    }
    if (!formData.bio || formData.bio.length < 50) {
      toast.error("Giới thiệu bản thân tối thiểu 50 ký tự");
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === "cvFile" || key === "degreeFiles") {
          if (formData[key]) {
            if (Array.isArray(formData[key])) {
              formData[key].forEach(file => submitData.append(key, file));
            } else {
              submitData.append(key, formData[key]);
            }
          }
        } else if (Array.isArray(formData[key])) {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      await tutorApi.registerTutor(submitData);
      toast.success("Đăng ký thành công! Đơn của bạn đang chờ admin duyệt.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Nếu user chưa đăng nhập
  if (!user) {
    return (
      <div className="pt-32 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Vui lòng đăng nhập để đăng ký làm gia sư
        </h2>
        <Link to="/login" className="text-indigo-600 hover:underline">
          Đi đến trang đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-slate-500 hover:text-indigo-600 font-bold mb-4"
          >
            <ChevronLeft className="h-5 w-5 mr-1" /> Quay lại
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
            Đăng ký trở thành gia sư
          </h1>
          <p className="text-slate-500">
            Điền đầy đủ thông tin bên dưới để gửi đơn đăng ký. Admin sẽ xem xét và phê duyệt trong vòng 24-48 giờ.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      step >= s
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                  </div>
                  <span className="text-xs font-medium mt-2 text-slate-600">
                    {s === 1 ? "Thông tin cơ bản" : s === 2 ? "Chuyên môn" : "Xác nhận"}
                  </span>
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      step > s ? "bg-indigo-600" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Thông tin cơ bản */}
          {step === 1 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Thông tin cá nhân
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="0912345678"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Ảnh đại diện
                  </label>
                  <div className="flex items-center gap-4">
                    <ImageWithFallback
                      src={formData.avatar}
                      alt={formData.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <input
                      type="url"
                      value={formData.avatar}
                      onChange={(e) => handleInputChange("avatar", e.target.value)}
                      placeholder="URL ảnh đại diện"
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Ngôn ngữ giảng dạy
                </label>
                <div className="flex flex-wrap gap-2">
                  {languagesList.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleLanguageToggle(lang)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.languages.includes(lang)
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Upload CV (PDF)
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                  <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 mb-2">
                    Kéo thả file hoặc click để chọn
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange("cvFile", e.target.files)}
                    className="hidden"
                    id="cv-upload"
                  />
                  <label
                    htmlFor="cv-upload"
                    className="inline-block px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium cursor-pointer hover:bg-indigo-100"
                  >
                    Chọn file
                  </label>
                  {formData.cvFile && (
                    <p className="mt-2 text-sm text-green-600">
                      ✓ {formData.cvFile.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all"
                >
                  Tiếp tục →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Chuyên môn */}
          {step === 2 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Thông tin chuyên môn
              </h2>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Môn học muốn dạy <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {subjectsList.map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => handleSubjectToggle(subject)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        formData.subjects.includes(subject)
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
                {formData.subjects.length > 0 && (
                  <p className="mt-2 text-sm text-slate-500">
                    Đã chọn: {formData.subjects.join(", ")}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Giá mỗi giờ (USD) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="number"
                    min="5"
                    step="1"
                    value={formData.hourlyRate}
                    onChange={(e) => handleInputChange("hourlyRate", e.target.value)}
                    placeholder="25"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Giá tham khảo: $15 - $50/giờ tùy kinh nghiệm
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Học vấn <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                  <textarea
                    value={formData.education}
                    onChange={(e) => handleInputChange("education", e.target.value)}
                    placeholder="VD: Cử nhân Sư phạm Toán - ĐH Sư phạm Hà Nội (2020)"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    rows={2}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Kinh nghiệm giảng dạy
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                  <textarea
                    value={formData.experience}
                    onChange={(e) => handleInputChange("experience", e.target.value)}
                    placeholder="VD: 5 năm dạy Toán THPT, 2 năm dạy online..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    rows={3}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Chứng chỉ (nếu có)
                </label>
                <div className="relative">
                  <Award className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                  <textarea
                    value={formData.certifications}
                    onChange={(e) => handleInputChange("certifications", e.target.value)}
                    placeholder="VD: TOEIC 900, IELTS 7.5, Chứng chỉ nghiệp vụ sư phạm..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    rows={2}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Giới thiệu bản thân <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Giới thiệu về phương pháp giảng dạy, phong cách, mục tiêu..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    rows={4}
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {formData.bio.length}/500 ký tự (tối thiểu 50)
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Thời gian có thể dạy
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availabilityOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleAvailabilityToggle(option.id)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        formData.availability.includes(option.id)
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <Clock className="h-4 w-4" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all"
                >
                  ← Quay lại
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all"
                >
                  Tiếp tục →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Xác nhận */}
          {step === 3 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Xác nhận thông tin đăng ký
              </h2>

              <div className="space-y-4 mb-8">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <h3 className="font-bold text-slate-900 mb-2">Thông tin cá nhân</h3>
                  <p><span className="text-slate-500">Họ tên:</span> {formData.name}</p>
                  <p><span className="text-slate-500">Email:</span> {formData.email}</p>
                  <p><span className="text-slate-500">SĐT:</span> {formData.phone}</p>
                  <p><span className="text-slate-500">Ngôn ngữ:</span> {formData.languages.join(", ")}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl">
                  <h3 className="font-bold text-slate-900 mb-2">Chuyên môn</h3>
                  <p><span className="text-slate-500">Môn dạy:</span> {formData.subjects.join(", ")}</p>
                  <p><span className="text-slate-500">Giá/giờ:</span> ${formData.hourlyRate}</p>
                  <p><span className="text-slate-500">Học vấn:</span> {formData.education}</p>
                  <p><span className="text-slate-500">Kinh nghiệm:</span> {formData.experience || "Chưa có"}</p>
                  <p><span className="text-slate-500">Giới thiệu:</span> {formData.bio.substring(0, 100)}...</p>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-8">
                <p className="text-sm text-amber-700">
                  <strong>Lưu ý:</strong> Đơn đăng ký của bạn sẽ được admin xem xét trong vòng 24-48 giờ. 
                  Bạn sẽ nhận được thông báo qua email khi đơn được duyệt.
                </p>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all"
                >
                  ← Quay lại
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {loading ? "Đang gửi..." : "Gửi đơn đăng ký"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}