import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  Heart,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import authApi from "../api/authApi";
import { useAuth } from "../context/AuthContext";

export function AuthPage() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isLogin =
    location.pathname === "/login" || location.pathname === "/admin/login";

  const [emailError, setEmailError] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [confirmPasswordError, setConfirmPasswordError] = React.useState("");

  const [role, setRole] = React.useState("student"); // mặc định student
  //thêm otp
  const [step, setStep] = React.useState(1);
  const [otp, setOtp] = React.useState("");
  const [timeLeft, setTimeLeft] = React.useState(60);
  const [canResend, setCanResend] = React.useState(false);
  const [registerEmail, setRegisterEmail] = React.useState("");
  const [resetEmail, setResetEmail] = React.useState("");

  const [loginError, setLoginError] = React.useState("");

  const [resetOtp, setResetOtp] = React.useState("");

  const [newPassword, setNewPassword] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [forgotError, setForgotError] = React.useState("");

  const [loginEmail, setLoginEmail] = React.useState("");
  const [loginPassword, setLoginPassword] = React.useState("");

  React.useEffect(() => {
    if (isLogin) {
      setStep(1);
    }
  }, [isLogin]);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regex.test(email)) {
      setEmailError("Email không đúng định dạng");
      return false;
    }

    setEmailError("");
    return true;
  };

  const validatePassword = (password) => {
    if (password.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }

    if (!/[A-Z]/.test(password)) {
      setPasswordError("Mật khẩu phải có ít nhất 1 chữ hoa");
      return false;
    }

    if (!/[a-z]/.test(password)) {
      setPasswordError("Mật khẩu phải có ít nhất 1 chữ thường");
      return false;
    }

    setPasswordError("");
    return true;
  };

  const validateConfirmPassword = (value, password) => {
    if (value !== password) {
      setConfirmPasswordError("Mật khẩu xác nhận không khớp");
      return false;
    }

    setConfirmPasswordError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        const data = {
          email: loginEmail,
          password: loginPassword,
        };

        const res = await authApi.login(data);

        login({
          user: res.data.user,
          token: res.data.token,
        }); // 🔥   QUAN TRỌNG

        toast.success("Đăng nhập thành công!");

        const role = res.data.user.role;

        if (role === "admin") {
          navigate("/admin/dashboard");
        } else if (role === "tutor") {
          navigate("/tutor/dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        const formData = new FormData(e.target);
        const data = {
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
        };
        if (!isLogin) {
          const emailValid = validateEmail(data.email);
          const passwordValid = validatePassword(data.password);

          const confirmValid = data.password === confirmPassword;

          if (!confirmValid) {
            setConfirmPasswordError("Mật khẩu xác nhận không khớp");
          }

          if (!emailValid || !passwordValid || !confirmValid) {
            return;
          }
        }

        // 🔥 CHỖ QUAN TRỌNG NHẤT
        if (role === "tutor") {
          await authApi.registerTutor(data);
        } else {
          await authApi.registerLearner(data);
        }

        setRegisterEmail(data.email);
        toast.success("OTP đã được gửi tới email!");

        setStep(2);
        setTimeLeft(60);
        setCanResend(false);
      }
    } catch (err) {
      if (isLogin) {
        const message = err.response?.data?.message || "";

        if (
          message.toLowerCase().includes("email") ||
          message.toLowerCase().includes("user")
        ) {
          setLoginError("Email chưa được đăng ký");
        } else if (message.toLowerCase().includes("password")) {
          setLoginError("Mật khẩu không đúng");
        } else {
          setLoginError("Đăng nhập thất bại");
        }

        return;
      }

      toast.error(err.response?.data?.message || "Lỗi server");
    }
  };
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    console.log("REGISTER EMAIL:", registerEmail);
    console.log("OTP:", otp);
    try {
      await authApi.verifyOTP({
        email: registerEmail,
        otp,
      });

      toast.success("Xác thực email thành công!");
      setStep(1);
      setOtp("");
      setRegisterEmail("");
      navigate("/login");
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Verify OTP failed",
      );
    }
  };
  const handleResendOTP = async () => {
    try {
      await authApi.resendOTP({
        email: registerEmail,
      });

      toast.success("Đã gửi lại OTP!");

      setTimeLeft(60);

      setCanResend(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Resend OTP failed");
    }
  };
  React.useEffect(() => {
    if (step !== 2 && step !== 4) return;

    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, step]);

  React.useEffect(() => {
    const userStr = localStorage.getItem("user");

    if (userStr) {
      const user = JSON.parse(userStr);

      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "tutor") {
        navigate("/tutor/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [navigate]);
  return (
    <div className="w-full flex flex-col lg:flex-row">
      {/* Left Column: Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center py-10">
        <div className="max-w-sm sm:max-w-md w-full mx-auto">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
              {isLogin ? "Chào mừng trở lại!" : "Tham gia cộng đồng"}
            </h1>
            <p className="text-slate-500 font-medium">
              {isLogin
                ? "Đăng nhập để tiếp tục các buổi học và tin nhắn của bạn."
                : "Tạo tài khoản và bắt đầu hành trình học tập ngay hôm nay."}
            </p>
          </div>

          {!isLogin && (
            <div className="flex p-1.5 bg-slate-50 rounded-[2rem] border border-slate-100 mb-10 shadow-inner">
              <button
                onClick={() => setRole("student")}
                className={`flex-1 py-3.5 rounded-[1.75rem] text-sm font-bold transition-all ${
                  role === "student"
                    ? "bg-white text-indigo-600 shadow-xl shadow-indigo-500/5 ring-1 ring-slate-100"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Tôi là học sinh
              </button>
              <button
                onClick={() => setRole("tutor")}
                className={`flex-1 py-3.5 rounded-[1.75rem] text-sm font-bold transition-all ${
                  role === "tutor"
                    ? "bg-white text-indigo-600 shadow-xl shadow-indigo-500/5 ring-1 ring-slate-100"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Tôi là gia sư
              </button>
            </div>
          )}
          {step === 1 && (
            <form
              onSubmit={handleSubmit}
              autoComplete="off"
              className="space-y-5"
            >
              {!isLogin && (
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    name="name"
                    type="text"
                    placeholder="Họ và tên"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-sm font-medium shadow-sm"
                  />
                </div>
              )}

              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  name="email"
                  type="email"
                  value={loginEmail}
                  autoComplete="email"
                  placeholder="Địa chỉ email"
                  required
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    validateEmail(e.target.value);
                    // KHÔNG xóa loginError ở đây nữa
                  }}
                  onClick={() => setLoginError("")} // Đúp chuột xóa thông báo lỗi
                  className={`w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl transition-all text-sm font-medium shadow-sm ${
                    emailError
                      ? "border border-red-500"
                      : "border border-slate-100"
                  }`}
                />
              </div>

              {emailError && (
                <p className="mt-1 text-xs text-red-500">{emailError}</p>
              )}

              <div className="space-y-2">
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />

                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    autoComplete="current-password"
                    placeholder="Mật khẩu"
                    required
                    onChange={(e) => {
                      const value = e.target.value;
                      setLoginPassword(e.target.value);
                      setPassword(value);
                      // KHÔNG xóa loginError ở đây nữa
                      if (!isLogin) {
                        validatePassword(value);
                      }
                    }}
                    onClick={() => setLoginError("")} // Đúp chuột xóa thông báo lỗi
                    className={`w-full pl-12 pr-12 py-3 bg-slate-50 rounded-2xl text-sm font-medium shadow-sm ${
                      passwordError
                        ? "border border-red-500"
                        : "border border-slate-100"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {!isLogin && password.length > 0 && (
                  <div
                    className={`mt-2 text-xs flex items-center gap-2 ${
                      passwordError ? "text-amber-600" : "text-green-600"
                    }`}
                  >
                    <span>{passwordError ? "⚠" : "✓"}</span>
                    <span>
                      {passwordError ? passwordError : "Mật khẩu hợp lệ"}
                    </span>
                  </div>
                )}
              </div>

              {!isLogin && (
                <div className="space-y-1">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />

                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Xác nhận mật khẩu"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        validateConfirmPassword(
                          e.target.value,
                          document.querySelector('input[name="password"]')
                            ?.value || "",
                        );
                      }}
                      className={`w-full pl-12 pr-12 py-3 bg-slate-50 rounded-2xl text-sm font-medium shadow-sm ${
                        confirmPasswordError
                          ? "border border-red-500"
                          : "border border-slate-100"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {confirmPasswordError && (
                    <p className="text-xs text-red-500">
                      {confirmPasswordError}
                    </p>
                  )}
                </div>
              )}

              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(3);
                      setResetEmail("");
                      setResetOtp("");
                      setNewPassword("");
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
              )}

              {isLogin && loginError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-sm font-medium text-red-600">
                    {loginError}
                  </p>
                </div>
              )}
              <button
                type="submit"
                className="w-full py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98] text-lg"
              >
                {isLogin ? "Đăng nhập" : "Tạo tài khoản"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div className="text-center">
                <h2 className="text-2xl font-bold">Nhập mã OTP</h2>

                <p className="text-slate-500 mt-2">Kiểm tra email của bạn</p>
              </div>

              <div className="relative group">
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  type="text"
                  placeholder="Nhập OTP"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl"
                />
              </div>

              {/* COUNTDOWN */}

              <div className="text-center">
                {!canResend ? (
                  <p className="text-sm text-slate-500">
                    OTP hết hạn sau:
                    <span className="font-bold text-indigo-600">
                      {" "}
                      {timeLeft}s
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-sm font-bold text-indigo-600 hover:underline"
                  >
                    Gửi lại mã OTP
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-5 bg-indigo-600 text-white font-bold rounded-2xl"
              >
                Xác thực OTP
              </button>
            </form>
          )}
          {step === 3 && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();

                try {
                  await authApi.forgotPassword({
                    email: resetEmail,
                  });

                  toast.success("OTP reset password đã được gửi!");

                  setStep(4);

                  setTimeLeft(60);

                  setCanResend(false);
                } catch (err) {
                  toast.error(err.response?.data?.message);
                }
              }}
              className="space-y-5"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold">Quên mật khẩu</h2>

                <p className="text-slate-500 mt-2">Nhập email để nhận OTP</p>
              </div>

              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />

                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Nhập email"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-5 bg-indigo-600 text-white font-bold rounded-2xl"
              >
                Gửi OTP
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-3 text-sm font-bold text-slate-500 hover:text-indigo-600"
              >
                Quay lại đăng nhập
              </button>
            </form>
          )}
          {step === 4 && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();

                try {
                  await authApi.resetPassword({
                    email: resetEmail,

                    otp: resetOtp,

                    newPassword,
                  });

                  toast.success("Đổi mật khẩu thành công!");

                  setStep(1);

                  setResetEmail("");

                  setResetOtp("");

                  setNewPassword("");
                } catch (err) {
                  toast.error(err.response?.data?.message);
                }
              }}
              className="space-y-5"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold">Đặt lại mật khẩu</h2>

                <p className="text-slate-500 mt-2">Nhập OTP và mật khẩu mới</p>
              </div>

              <input
                value={resetOtp}
                onChange={(e) => setResetOtp(e.target.value)}
                type="text"
                placeholder="Nhập OTP"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl"
              />

              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                type="password"
                placeholder="Mật khẩu mới"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl"
              />

              {/* COUNTDOWN */}

              <div className="text-center">
                {!canResend ? (
                  <p className="text-sm text-slate-500">
                    OTP hết hạn sau:
                    <span className="font-bold text-indigo-600">
                      {" "}
                      {timeLeft}s
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await authApi.forgotPassword({
                          email: resetEmail,
                        });

                        toast.success("Đã gửi lại OTP!");

                        setTimeLeft(60);

                        setCanResend(false);
                      } catch (err) {
                        toast.error(err.response?.data?.message);
                      }
                    }}
                    className="text-sm font-bold text-indigo-600 hover:underline"
                  >
                    Gửi lại mã OTP
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-5 bg-indigo-600 text-white font-bold rounded-2xl"
              >
                Đổi mật khẩu
              </button>
            </form>
          )}
          <div className="my-10 flex items-center">
            <div className="flex-1 border-t border-slate-100"></div>
            <span className="mx-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
              hoặc tiếp tục với
            </span>
            <div className="flex-1 border-t border-slate-100"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center space-x-3 py-4 bg-white border-2 border-slate-50 rounded-2xl hover:bg-slate-50 hover:border-slate-100 transition-all shadow-sm">
              <FaGoogle className="h-5 w-5" />
              <span className="text-sm font-bold text-slate-700">Google</span>
            </button>
            <button className="flex items-center justify-center space-x-3 py-4 bg-white border-2 border-slate-50 rounded-2xl hover:bg-slate-50 hover:border-slate-100 transition-all shadow-sm">
              <FaGithub className="h-5 w-5" />
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

          {isLogin && (
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <Link
                to="/admin/login"
                className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
              >
                Đăng nhập quản trị viên
              </Link>
            </div>
          )}
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

        <div className="relative z-10 h-full flex flex-col items-center justify-center px-10 text-center text-white">
          <div className="max-w-xl mx-auto">
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

                <h2 className="text-2xl xl:text-3xl font-bold mb-6 leading-snug">
                  {role === "student"
                    ? "Nâng cao việc học của bạn với sự hướng dẫn 1-1 từ chuyên gia."
                    : "Biến kiến thức thành thu nhập và tạo ảnh hưởng."}
                </h2>

                <p className="text-base text-indigo-100/80 mb-10 leading-relaxed">
                  {role === "student"
                    ? "Tham gia cùng hơn 50.000 học sinh đạt thành công mỗi học kỳ nhờ sự hỗ trợ học tập cá nhân hóa."
                    : "Trao quyền cho thế hệ người học tiếp theo trong khi xây dựng sự nghiệp linh hoạt của riêng bạn."}
                </p>

                <div className="space-y-6">
                  {[
                    {
                      icon: ShieldCheck,
                      text: "Gia sư đã xác thực & Thanh toán an toàn",
                    },
                    { icon: Heart, text: "Trải nghiệm học tập cá nhân hóa" },
                    {
                      icon: GraduationCap,
                      text: "Đạt được mục tiêu học tập của bạn",
                    },
                  ].map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-4 text-left p-6 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 hover:bg-white/10 transition-colors"
                    >
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
    </div>
  );
}
