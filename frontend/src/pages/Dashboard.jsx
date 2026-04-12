import React from "react";
import {
  Calendar, Clock, User, Heart, CreditCard, Settings,
  ChevronRight, LogOut, LayoutDashboard, MessageSquare, ExternalLink,
  Search, Bell
} from "lucide-react";
import { Link } from "react-router-dom";
import { sessions, tutors } from "../mockData";
import { ImageWithFallback } from "../components/Image/ImageWithFallback";
import { motion } from "framer-motion";

export function DashboardPage() {
  const [activeTab, setActiveTab] = React.useState("sessions");

  const sidebarItems = [
    { id: "sessions", name: "Buổi học của tôi", icon: Calendar },
    { id: "messages", name: "Tin nhắn", icon: MessageSquare, badge: 2 },
    { id: "favorites", name: "Gia sư đã lưu", icon: Heart },
    { id: "billing", name: "Thanh toán", icon: CreditCard },
    { id: "settings", name: "Cài đặt", icon: Settings },
  ];

  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="sticky top-28 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 mb-8 lg:mb-0">
              <div className="flex flex-col items-center mb-10 p-4 bg-indigo-50 rounded-2xl relative overflow-hidden">
                <div className="relative w-20 h-20 rounded-full border-4 border-white shadow-xl overflow-hidden mb-4 z-10">
                  <ImageWithFallback src="https://i.pravatar.cc/150?u=u1" alt="Ảnh đại diện học viên" />
                </div>
                <h3 className="font-bold text-slate-900 z-10">Alex Johnson</h3>
                <p className="text-xs font-bold text-indigo-600 z-10 uppercase tracking-widest">Gói học viên</p>
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-indigo-600/10 rounded-full blur-xl"></div>
              </div>

              <nav className="space-y-2">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                      activeTab === item.id
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                        : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        activeTab === item.id ? "bg-white text-indigo-600" : "bg-indigo-600 text-white"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
                <button className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl font-bold text-sm text-rose-500 hover:bg-rose-50 transition-all mt-6 border-t border-slate-100 pt-10">
                  <LogOut className="h-5 w-5" />
                  <span>Đăng xuất</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 space-y-8 pb-20">
            {/* Top Bar for Dashboard */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 mb-2 capitalize">
                  {activeTab === "sessions" && "Buổi học"}
                  {activeTab === "messages" && "Tin nhắn"}
                  {activeTab === "favorites" && "Gia sư đã lưu"}
                  {activeTab === "billing" && "Thanh toán"}
                  {activeTab === "settings" && "Cài đặt"}
                </h1>
                <p className="text-slate-500 font-medium">Chào mừng trở lại, Alex. Bạn có 2 buổi học trong tuần này.</p>
              </div>
              <div className="flex items-center space-x-3">
                <Link to="/search" className="bg-white px-5 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-700 flex items-center hover:bg-slate-50 transition-all shadow-sm">
                  <Search className="h-4 w-4 mr-2" /> Tìm gia sư
                </Link>
                <button className="p-3 bg-white rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm relative">
                  <Bell className="h-5 w-5 text-slate-500" />
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-indigo-600 border-2 border-white rounded-full"></span>
                </button>
              </div>
            </div>

            {/* Dynamic Tab Content */}
            <div className="grid gap-8">
              {activeTab === "sessions" && (
                <div className="space-y-6">
                  <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                      <div className="max-w-md">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-bold mb-4">
                          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                          <span>Bài học tiếp theo sau 4 giờ</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Giải tích II với TS. Sarah Mitchell</h2>
                        <p className="text-indigo-100 text-sm mb-6 opacity-80">Hôm nay, 15 tháng 3 lúc 10:00 sáng • Zoom Meeting</p>
                        <div className="flex flex-wrap gap-4">
                          <a
                            href="https://zoom.us"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-2xl flex items-center hover:bg-slate-50 transition-all shadow-xl"
                          >
                            Tham gia <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                          <button className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all">
                            Đổi lịch
                          </button>
                        </div>
                      </div>
                      <div className="w-48 h-48 bg-white/10 rounded-full p-4 backdrop-blur-sm">
                        <div className="w-full h-full bg-indigo-500 rounded-full flex items-center justify-center p-4">
                          <Calendar className="h-16 w-16 text-white opacity-80" />
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                  </div>

                  <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                      <h3 className="text-xl font-bold text-slate-900">Buổi học sắp tới</h3>
                      <button className="text-sm font-bold text-indigo-600 hover:underline">Xem lịch</button>
                    </div>
                    <div className="space-y-4">
                      {sessions.map((session) => (
                        <div key={session.id} className="group p-5 bg-slate-50 rounded-3xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all duration-300 flex flex-col md:flex-row justify-between items-center gap-4">
                          <div className="flex items-center space-x-5">
                            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center">
                              <Calendar className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-lg">{session.subject}</h4>
                              <div className="flex items-center text-slate-500 text-sm mt-1">
                                <span className="font-bold">{session.date}</span>
                                <span className="mx-2">•</span>
                                <span>{session.time}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex -space-x-3 mr-4">
                              <ImageWithFallback src={tutors.find(t => t.id === session.tutorId)?.avatar || ""} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                            </div>
                            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
                              Quản lý
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "favorites" && (
                <div className="grid md:grid-cols-2 gap-6">
                  {tutors.slice(0, 2).map((tutor) => (
                    <div key={tutor.id} className="bg-white rounded-3xl border border-slate-200 p-6 flex items-start space-x-4 shadow-sm">
                      <ImageWithFallback src={tutor.avatar} className="w-16 h-16 rounded-2xl object-cover" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-900">{tutor.name}</h4>
                          <button className="text-rose-500"><Heart className="h-5 w-5 fill-current" /></button>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">{tutor.subjects[0]}</p>
                        <Link to={`/tutor/${tutor.id}`} className="text-xs font-bold text-indigo-600 hover:underline">Xem hồ sơ</Link>
                      </div>
                    </div>
                  ))}
                  <Link to="/search" className="bg-slate-100 border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-slate-400 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all">
                    <Heart className="h-8 w-8 mb-2" />
                    <span className="font-bold">Thêm gia sư</span>
                  </Link>
                </div>
              )}

              {activeTab === "billing" && (
                <div className="space-y-6">
                  <div className="bg-slate-900 rounded-3xl p-8 text-white">
                    <h3 className="text-lg font-bold mb-6">Số dư ví</h3>
                    <div className="text-5xl font-extrabold mb-8">$120.00</div>
                    <div className="flex space-x-4">
                      <button className="px-6 py-3 bg-indigo-600 rounded-2xl font-bold hover:bg-indigo-700 transition-all">Nạp tiền</button>
                      <button className="px-6 py-3 bg-white/10 rounded-2xl font-bold hover:bg-white/20 transition-all">Lịch sử giao dịch</button>
                    </div>
                  </div>
                  <div className="bg-white rounded-3xl border border-slate-200 p-8">
                    <h4 className="font-bold text-slate-900 mb-6">Phương thức thanh toán đã lưu</h4>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-8 bg-slate-200 rounded-md"></div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">•••• •••• •••• 4242</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hết hạn 12/28</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 bg-indigo-100 text-indigo-600 rounded-md">CHÍNH</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}