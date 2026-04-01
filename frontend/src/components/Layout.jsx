import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { GraduationCap, MessageSquare, Search, User, Menu, X, Bell } from "lucide-react";
import { motion , AnimatePresence } from "framer-motion";

export function Layout() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Find Tutors", path: "/search", icon: Search },
    { name: "Dashboard", path: "/dashboard", icon: GraduationCap },
    { name: "Messages", path: "/messages", icon: MessageSquare },
  ];

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
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-indigo-600 p-2 rounded-xl">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className={`text-xl font-bold tracking-tight ${
                isScrolled || location.pathname !== "/" ? "text-slate-900" : "text-white"
              }`}>
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
                    isScrolled || location.pathname !== "/" ? "text-slate-600" : "text-white/90"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex items-center space-x-4">
                <button className={`p-2 rounded-full transition-colors hover:bg-slate-100 ${
                  isScrolled || location.pathname !== "/" ? "text-slate-600" : "text-white/90"
                }`}>
                  <Bell className="h-5 w-5" />
                </button>
                <Link
                  to="/login"
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    isScrolled || location.pathname !== "/"
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg"
                      : "bg-white text-indigo-600 hover:bg-slate-100 shadow-md"
                  }`}
                >
                  Join Now
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-lg transition-colors ${
                  isScrolled || location.pathname !== "/" ? "text-slate-900" : "text-white"
                }`}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
            >
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
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full text-center py-4 text-base font-semibold text-white bg-indigo-600 rounded-xl shadow-md"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="pt-0">
        <Outlet />
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
                Empowering students to achieve their academic goals through personalized tutoring from the best educators.
              </p>
            </div>
            
            <div>
              <h4 className="text-slate-900 font-bold mb-6">Explore</h4>
              <ul className="space-y-4">
                <li><Link to="/search" className="text-slate-500 hover:text-indigo-600 text-sm">Math Tutors</Link></li>
                <li><Link to="/search" className="text-slate-500 hover:text-indigo-600 text-sm">Science Tutors</Link></li>
                <li><Link to="/search" className="text-slate-500 hover:text-indigo-600 text-sm">Language Tutors</Link></li>
                <li><Link to="/search" className="text-slate-500 hover:text-indigo-600 text-sm">Test Prep</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-900 font-bold mb-6">For Tutors</h4>
              <ul className="space-y-4">
                <li><Link to="/signup" className="text-slate-500 hover:text-indigo-600 text-sm">Become a Tutor</Link></li>
                <li><Link to="/dashboard" className="text-slate-500 hover:text-indigo-600 text-sm">Tutor Dashboard</Link></li>
                <li><Link to="/" className="text-slate-500 hover:text-indigo-600 text-sm">Guidelines</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-900 font-bold mb-6">Support</h4>
              <ul className="space-y-4">
                <li><Link to="/" className="text-slate-500 hover:text-indigo-600 text-sm">Help Center</Link></li>
                <li><Link to="/" className="text-slate-500 hover:text-indigo-600 text-sm">Trust & Safety</Link></li>
                <li><Link to="/" className="text-slate-500 hover:text-indigo-600 text-sm">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-slate-400 text-sm">© 2026 TutorLink. All rights reserved.</p>
            <div className="flex space-x-6 text-slate-400">
              {/* Social icons could go here */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}