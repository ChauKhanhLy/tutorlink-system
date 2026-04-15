import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  MessageSquare,
  Search,
  Menu,
  X,
  Bell,
  Calendar,
  Users,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export function Layout() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // scroll
  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // click outside
  React.useEffect(() => {
    const handleClickOutside = () => setOpen(false);

    document.addEventListener("click", handleClickOutside);

    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const learnerNavLinks = [
    { name: "Tìm gia sư", path: "/search", icon: Search },
    { name: "Dashboard", path: "/dashboard", icon: GraduationCap },
    { name: "Tin nhắn", path: "/messages", icon: MessageSquare },
  ];

  const tutorNavLinks = [
    { name: "Dashboard", path: "/dashboard", icon: GraduationCap },
    { name: "Lịch dạy", path: "/tutor/schedule", icon: Calendar },
    { name: "Học viên", path: "/tutor/students", icon: Users },
    { name: "Tin nhắn", path: "/messages", icon: MessageSquare },
  ];

  const navLinks = user?.role === "tutor" ? tutorNavLinks : learnerNavLinks;

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || location.pathname !== "/"
            ? "bg-white shadow-sm border-b border-slate-200 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link
              to={user ? "/dashboard" : "/"}
              className="flex items-center space-x-2"
            >
              <div className="bg-indigo-600 p-2 rounded-xl">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span
                className={`text-xl font-bold tracking-tight ${
                  isScrolled || location.pathname !== "/"
                    ? "text-slate-900"
                    : "text-white"
                }`}
              >
                TutorLink
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
                    isScrolled || location.pathname !== "/"
                      ? "text-slate-600"
                      : "text-white/90"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex items-center space-x-4 relative">
                <button
                  className={`p-2 rounded-full transition-colors hover:bg-slate-100 ${
                    isScrolled || location.pathname !== "/"
                      ? "text-slate-600"
                      : "text-white/90"
                  }`}
                >
                  <Bell className="h-5 w-5" />
                </button>

                {user ? (
                  <div className="relative">
                    <div
                      onClick={(e) => {
                        e.stopPropagation(); // 🔥 ngăn click lan ra document
                        setOpen(!open);
                      }}
                    >
                      <img
                        src={user?.avatar || "/avatar.png"}
                        alt="avatar"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {user.name}
                      </span>
                    </div>

                    {open && (
                      <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                        {user?.role === "tutor" ? (
                          <>
                            <Link
                              to="/dashboard"
                              className="block px-4 py-2 text-sm hover:bg-slate-100"
                              onClick={() => setOpen(false)}
                            >
                              Dashboard Gia sư
                            </Link>
                            <Link
                              to="/tutor/schedule"
                              className="block px-4 py-2 text-sm hover:bg-slate-100"
                              onClick={() => setOpen(false)}
                            >
                              Lịch dạy
                            </Link>
                          </>
                        ) : (
                          <Link
                            to="/dashboard"
                            className="block px-4 py-2 text-sm hover:bg-slate-100"
                            onClick={() => setOpen(false)}
                          >
                            Dashboard
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm hover:bg-slate-100"
                          onClick={() => setOpen(false)}
                        >
                          Hồ sơ
                        </Link>
                        <Link
                          to="/messages"
                          className="block px-4 py-2 text-sm hover:bg-slate-100"
                          onClick={() => setOpen(false)}
                        >
                          Tin nhắn
                        </Link>
                        <div className="border-t my-2"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-slate-100"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className={`px-4 py-2 text-sm font-semibold rounded-full border ${
                        isScrolled || location.pathname !== "/"
                          ? "text-slate-700 border-slate-300 hover:bg-slate-100"
                          : "text-white border-white/50 hover:bg-white/10"
                      }`}
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/signup"
                      className={`px-5 py-2.5 text-sm font-semibold rounded-full ${
                        isScrolled || location.pathname !== "/"
                          ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
                          : "bg-white text-indigo-600 hover:bg-slate-100 shadow-md"
                      }`}
                    >
                      Đăng ký
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-lg transition-colors ${
                  isScrolled || location.pathname !== "/"
                    ? "text-slate-900"
                    : "text-white"
                }`}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <div className="md:hidden bg-white border-b border-slate-200 overflow-hidden">
              <div className="px-4 pt-2 pb-6 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-3 py-4 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-xl"
                  >
                    <link.icon className="h-5 w-5 text-indigo-600" />
                    <span>{link.name}</span>
                  </Link>
                ))}
                <div className="pt-4 flex flex-col space-y-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full text-center py-4 text-base font-semibold text-slate-700 border border-slate-200 rounded-xl"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full text-center py-4 text-base font-semibold text-white bg-indigo-600 rounded-xl shadow-md"
                  >
                    Đăng ký
                  </Link>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </nav>

      <main className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <Link to="/" className="flex items-center space-x-2 mb-6">
                <div className="bg-indigo-600 p-2 rounded-xl">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  TutorLink
                </span>
              </Link>
              <p className="text-slate-500 leading-relaxed text-sm">
                Empowering students to achieve their academic goals through
                personalized tutoring from the best educators.
              </p>
            </div>

            <div>
              <h4 className="text-slate-900 font-bold mb-6">Explore</h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/search"
                    className="text-slate-500 hover:text-indigo-600 text-sm"
                  >
                    Math Tutors
                  </Link>
                </li>
                <li>
                  <Link
                    to="/search"
                    className="text-slate-500 hover:text-indigo-600 text-sm"
                  >
                    Science Tutors
                  </Link>
                </li>
                <li>
                  <Link
                    to="/search"
                    className="text-slate-500 hover:text-indigo-600 text-sm"
                  >
                    Language Tutors
                  </Link>
                </li>
                <li>
                  <Link
                    to="/search"
                    className="text-slate-500 hover:text-indigo-600 text-sm"
                  >
                    Test Prep
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-900 font-bold mb-6">For Tutors</h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/signup"
                    className="text-slate-500 hover:text-indigo-600 text-sm"
                  >
                    Become a Tutor
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className="text-slate-500 hover:text-indigo-600 text-sm"
                  >
                    Tutor Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    className="text-slate-500 hover:text-indigo-600 text-sm"
                  >
                    Guidelines
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-900 font-bold mb-6">Support</h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/"
                    className="text-slate-500 hover:text-indigo-600 text-sm"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    className="text-slate-500 hover:text-indigo-600 text-sm"
                  >
                    Trust & Safety
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    className="text-slate-500 hover:text-indigo-600 text-sm"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0">
            <p className="text-slate-400 text-sm">
              © 2026 TutorLink. All rights reserved.
            </p>
            <div className="flex space-x-6 text-slate-400">
              {/* Social icons could go here */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
