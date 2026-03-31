import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  GraduationCap, Mail, Lock, User,
  ChevronRight, CheckCircle2, ShieldCheck, Heart
} from "lucide-react";

import { FaGithub, FaGoogle } from "react-icons/fa";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname === "/login";
  const [role, setRole] = React.useState("student"); // mặc định student

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success(`Đăng nhập thành công với vai trò ${role === "student" ? "học sinh" : "gia sư"}!`);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Left Column: Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 md:px-20 lg:px-24 xl:px-32 relative">
        <div className="absolute top-10 left-10 md:left-24">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              TutorLink
            </span>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
              {isLogin ? "Chào mừng trở lại!" : "Tham gia cộng đồng"}
            </h1>
            <p className="text-slate-500 font-medium">
              {isLogin
                ? "Đăng nhập để tiếp tục các buổi học và tin nhắn của bạn."
                : "Tạo tài khoản và bắt đầu hành trình học tập ngay hôm nay."
              }
            </p>
          </div>

          {!isLogin && (
            <div className="flex p-1.5 bg-slate-50 rounded-[2rem] border border-slate-100 mb-10 shadow-inner">
              <button
                onClick={() => setRole("student")}
                className={`flex-1 py-3.5 rounded-[1.75rem] text-sm font-bold transition-all ${
                  role === "student" ? "bg-white text-indigo-600 shadow-xl shadow-indigo-500/5 ring-1 ring-slate-100" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Tôi là học sinh
              </button>
              <button
                onClick={() => setRole("tutor")}
                className={`flex-1 py-3.5 rounded-[1.75rem] text-sm font-bold transition-all ${
                  role === "tutor" ? "bg-white text-indigo-600 shadow-xl shadow-indigo-500/5 ring-1 ring-slate-100" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Tôi là gia sư
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Họ và tên"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-sm font-medium shadow-sm"
                />
              </div>
            )}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="email"
                placeholder="Địa chỉ email"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-sm font-medium shadow-sm"
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="password"
                placeholder="Mật khẩu"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-sm font-medium shadow-sm"
              />
            </div>
            {isLogin && (
              <div className="text-right">
                <button type="button" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
                  Quên mật khẩu?
                </button>
              </div>
            )}
            <button
              type="submit"
              className="w-full py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98] text-lg"
            >
              {isLogin ? "Đăng nhập" : "Tạo tài khoản"}
            </button>
          </form>

          <div className="my-10 flex items-center">
            <div className="flex-1 border-t border-slate-100"></div>
            <span className="mx-4 text-xs font-bold text-slate-400 uppercase tracking-widest">hoặc tiếp tục với</span>
            <div className="flex-1 border-t border-slate-100"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center space-x-3 py-4 bg-white border-2 border-slate-50 rounded-2xl hover:bg-slate-50 hover:border-slate-100 transition-all shadow-sm">
              <FaGoogle className="h-5 w-5" />
              <span className="text-sm font-bold text-slate-700">Google</span>
            </button>
            <button className="flex items-center justify-center space-x-3 py-4 bg-white border-2 border-slate-50 rounded-2xl hover:bg-slate-50 hover:border-slate-100 transition-all shadow-sm">
              <Github className="h-5 w-5" />
              <span className="text-sm font-bold text-slate-700">GitHub</span>
            </button>
          </div>

          <p className="mt-12 text-center text-slate-500 font-medium">
            {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
            <Link
              to={isLogin ? "/signup" : "/login"}
              className="ml-2 font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              {isLogin ? "Đăng ký" : "Đăng nhập"}
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column: Visual Section */}
      <div className="hidden lg:block lg:w-1/2 bg-indigo-600 relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse delay-700"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-10">
            <div className="w-full h-full border-[1px] border-white/20 rounded-full scale-100"></div>
            <div className="absolute inset-0 border-[1px] border-white/20 rounded-full scale-75"></div>
            <div className="absolute inset-0 border-[1px] border-white/20 rounded-full scale-50"></div>
          </div>
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center px-20 text-center text-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="max-w-lg"
            >
              <div className="mb-12 inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-indigo-100 text-xs font-bold uppercase tracking-widest">
                <CheckCircle2 className="h-4 w-4 text-white" />
                <span>Mạng lưới học thuật đã xác thực</span>
              </div>

              <h2 className="text-4xl xl:text-5xl font-extrabold mb-8 leading-tight">
                {role === "student"
                  ? "Nâng cao việc học của bạn với sự hướng dẫn 1-1 từ chuyên gia."
                  : "Biến kiến thức thành thu nhập và tạo ảnh hưởng."
                }
              </h2>

              <p className="text-xl text-indigo-100/80 mb-16 leading-relaxed font-medium">
                {role === "student"
                  ? "Tham gia cùng hơn 50.000 học sinh đạt thành công mỗi học kỳ nhờ sự hỗ trợ học tập cá nhân hóa."
                  : "Trao quyền cho thế hệ người học tiếp theo trong khi xây dựng sự nghiệp linh hoạt của riêng bạn."
                }
              </p>

              <div className="space-y-6">
                {[
                  { icon: ShieldCheck, text: "Gia sư đã xác thực & Thanh toán an toàn" },
                  { icon: Heart, text: "Trải nghiệm học tập cá nhân hóa" },
                  { icon: GraduationCap, text: "Đạt được mục tiêu học tập của bạn" }
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-4 text-left p-6 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="p-3 bg-white/10 rounded-2xl">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-bold text-lg">{feature.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}