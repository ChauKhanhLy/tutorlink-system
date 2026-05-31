import React from "react";
import {
  Calendar,
  Clock,
  User,
  Heart,
  CreditCard,
  Settings,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  MessageSquare,
  ExternalLink,
  Search,
  Bell,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { tutorApi } from "../api/tutorApi";
import { bookingApi } from "../api/bookingApi";
import { favoriteApi } from "../api/favoriteApi";
import { FeedbackMiniPage } from "../components/FeedbackMiniPage";
import messageApi from "../api/messageApi";
//import { billingApi } from "../api/billingApi";
import { ImageWithFallback } from "../components/Image/ImageWithFallback";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { TutorDashboard } from "./TutorDashboard";
import { getAvatarUrl } from "../utils/avatar";

export function DashboardPage() {
  const { user, logout } = useAuth();

  if (user?.role === "tutor") {
    return <TutorDashboard />;
  }

  const [sessions, setSessions] = React.useState([]);
  const [tutors, setTutors] = React.useState([]);
  const [activeTab, setActiveTab] = React.useState("sessions");
  const [favorites, setFavorites] = React.useState([]);
  const [messages, setMessages] = React.useState([]);
  const [wallet, setWallet] = React.useState(null);
  const [feedbackData, setFeedbackData] = React.useState(null);

  const sidebarItems = [
    { id: "sessions", name: "Buổi học của tôi", icon: Calendar },
    {
      id: "messages",
      name: "Tin nhắn",
      icon: MessageSquare,
      badge: messages?.length || 0,
    },
    { id: "favorites", name: "Gia sư đã lưu", icon: Heart },
    { id: "wallet", name: "Ví của tôi", icon: Wallet, href: "/wallet" },
    { id: "settings", name: "Cài đặt", icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const fetchData = React.useCallback(async () => {
    try {
      const [tutorRes, bookingRes, messageRes, favoriteRes] = await Promise.all([
        tutorApi.getAll(),
        bookingApi.getMyBookings(),
        messageApi.getConversations(user.id),
        favoriteApi.getMyFavorites(),
      ]);
      setTutors(tutorRes.data.tutors || []);
      setSessions(bookingRes.data);
      setMessages(messageRes.data);
      setFavorites(favoriteRes.data.data || []);
    } catch (err) {
      console.log(err);
    }
  }, [user?.id]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [tutorRes, bookingRes, messageRes, favoriteRes] = await Promise.all([
          tutorApi.getAll(),
          bookingApi.getMyBookings(),
          messageApi.getConversations(user.id),
          favoriteApi.getMyFavorites(),
        ]);

        setTutors(tutorRes.data.tutors || []);
        setSessions(bookingRes.data);
        setMessages(messageRes.data);
        setFavorites(favoriteRes.data.data || []);
      } catch (err) {
        console.log(err);
      }
    };

    if (user?.id) fetchData();
  }, [user?.id]);

  // Socket listener cho booking status changes
  React.useEffect(() => {
    if (!user?.id) return;

    console.log("Setting up socket listener for user:", user.id);

    // Import socket
    import("../socket.js").then(({ default: socket }) => {
      if (socket) {
        console.log("Socket connected, registering user:", user.id);

        // Register user với socket
        socket.emit("register_user", user.id);

        // Lắng nghe thay đổi status của booking
        socket.on("booking_status_changed", (data) => {
          console.log("Booking status changed received:", data);

          // Refresh lại data bookings
          fetchData();

          // Show toast notification
          import("sonner").then(({ toast }) => {
            toast.info(data.message || "Trạng thái lịch học đã thay đổi");
          });
        });

        return () => {
          console.log("Cleaning up socket listener");
          socket.off("booking_status_changed");
        };
      } else {
        console.log("Socket not available");
      }
    });
  }, [user?.id]);

  const nextSession = sessions
    ?.filter((s) => new Date(s.date) > new Date()) // buổi trong tương lai
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  const nextTutor = tutors.find((t) => t.id === nextSession?.tutorId);

  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="sticky top-28 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 mb-8 lg:mb-0">
              <div className="flex flex-col items-center mb-10 p-4 bg-indigo-50 rounded-2xl relative overflow-hidden">
                <div className="relative w-20 h-20 rounded-full border-4 border-white shadow-xl overflow-hidden mb-4 z-10">
                  {/* <ImageWithFallback
                    src={user?.avatar || "https://i.pravatar.cc/150"}
                    alt={user?.name}
                  /> */}
                  {/* <ImageWithFallback
                    src={
                      user?.avatar
                        ? user.avatar.startsWith("http")
                          ? user.avatar
                          : `http://localhost:3000${user.avatar}`
                        : "https://i.pravatar.cc/150"
                    }
                    alt={user?.name}
                    className="w-full h-full object-cover"
                  /> */}
                  <ImageWithFallback
                    src={getAvatarUrl(user?.avatar)}
                    alt={user?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-slate-900 z-10">
                  {user?.name || "User"}
                </h3>
                <p className="text-xs font-bold text-indigo-600 z-10 uppercase tracking-widest">
                  {user?.role === "admin"
                    ? "Gói Admin"
                    : user?.role === "tutor"
                      ? "Gói Gia sư"
                      : "Gói Học viên"}
                </p>
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-indigo-600/10 rounded-full blur-xl"></div>
              </div>

              <nav className="space-y-2">
                {sidebarItems.map((item) => {
                  const isActive = activeTab === item.id;
                  const commonClasses = `w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
                  }`;

                  if (item.id === "messages") {
                    return (
                      <Link
                        key={item.id}
                        to="/messages"
                        className={commonClasses}
                        onClick={() => setActiveTab(item.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                              isActive
                                ? "bg-white text-indigo-600"
                                : "bg-indigo-600 text-white"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  }

                  // Nếu có href, chuyển thẳng đến trang đó
                  if (item.href) {
                    return (
                      <Link
                        key={item.id}
                        to={item.href}
                        className={commonClasses}
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </div>
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={commonClasses}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                            isActive
                              ? "bg-white text-indigo-600"
                              : "bg-indigo-600 text-white"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl font-bold text-sm text-rose-500 hover:bg-rose-50 transition-all mt-6 border-t border-slate-100 pt-10"
                >
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
                  {activeTab === "wallet" && "Ví của tôi"}
                  {activeTab === "settings" && "Cài đặt"}
                </h1>
                <p className="text-slate-500 font-medium">
                  Chào mừng {user?.name || "bạn"}. Bạn có 2 buổi học trong tuần
                  này.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Link
                  to="/search"
                  className="bg-white px-5 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-700 flex items-center hover:bg-slate-50 transition-all shadow-sm"
                >
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
                        {nextSession ? (
                          <>
                            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-bold mb-4">
                              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                              <span>
                                Bài học tiếp theo sau{" "}
                                {Math.max(
                                  1,
                                  Math.floor(
                                    (new Date(nextSession.date) - new Date()) /
                                      (1000 * 60 * 60),
                                  ),
                                )}{" "}
                                giờ
                              </span>
                            </div>

                            <h2 className="text-3xl font-bold mb-2">
                              {nextSession.subject || "Chưa có môn"} với{" "}
                              {nextTutor?.name || "Gia sư"}
                            </h2>

                            <p className="text-indigo-100 text-sm mb-6 opacity-80">
                              {new Date(nextSession.date).toLocaleDateString()}{" "}
                              lúc {nextSession.time || "??"} •{" "}
                              {nextSession.meetingLink ? "Online" : "Offline"}
                            </p>

                            <div className="flex flex-wrap gap-4">
                              {nextSession?.room_id ? (
                                <Link
                                  to={`/room/${nextSession.room_id || nextSession.id}`}
                                  className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-2xl flex items-center hover:bg-slate-50 transition-all shadow-xl"
                                >
                                  Tham gia{" "}
                                  <ExternalLink className="ml-2 h-4 w-4" />
                                </Link>
                              ) : nextSession?.meetingLink ? (
                                <a
                                  href={nextSession.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-2xl flex items-center hover:bg-slate-50 transition-all shadow-xl"
                                >
                                  Tham gia{" "}
                                  <ExternalLink className="ml-2 h-4 w-4" />
                                </a>
                              ) : null}

                              <button className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all">
                                Đổi lịch
                              </button>
                            </div>
                          </>
                        ) : (
                          <p className="text-white">Chưa có buổi học sắp tới</p>
                        )}
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
                      <h3 className="text-xl font-bold text-slate-900">
                        Buổi học sắp tới
                      </h3>
                      <button className="text-sm font-bold text-indigo-600 hover:underline">
                        Xem lịch
                      </button>
                    </div>
                    <div className="space-y-4">
                      {sessions.map((session) => {
                        const tutor = tutors.find(
                          (t) => t.id === session.tutorId,
                        );
                        const now = new Date();
                        const startTime = new Date(
                          session.room_start_time ||
                            session.datetime ||
                            session.date,
                        );
                        const endTime = new Date(
                          session.room_end_time ||
                            new Date(startTime).getTime() + 60 * 60 * 1000,
                        );

                        // Cho phép vào phòng bất cứ lúc nào nếu có room_id (phục vụ testing)
                        //const canJoin = !!session.room_id && session.status !== 'cancelled' && session.status !== 'done';
                        const canJoin =
                          (!!session.room_id || !!session.roomId) &&
                          session.status !== "cancelled" &&
                          session.status !== "done";

                        if (
                          session.type === "trial" ||
                          session.status === "confirmed"
                        ) {
                          console.log(
                            "Confirmed/Trial Session details:",
                            JSON.stringify(session, null, 2),
                          );
                        }

                        // Kiểm tra xem có thể đánh giá không
                        const canReview =
                          session.status === "completed" &&
                          now >=
                            new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

                        return (
                          <div
                            key={session.id}
                            className="group p-5 bg-slate-50 rounded-3xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all duration-300 flex flex-col md:flex-row justify-between items-center gap-4"
                          >
                            <div className="flex items-center space-x-5">
                              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-indigo-600" />
                              </div>

                              <div>
                                <h4 className="font-bold text-slate-900 text-lg">
                                  {session.subject || "Chưa có môn"}
                                </h4>

                                <div className="flex items-center text-slate-500 text-sm mt-1">
                                  <span className="font-bold">
                                    {session.dateObj
                                      ? session.dateObj.toLocaleDateString(
                                          "vi-VN",
                                        )
                                      : session.date || session.datetime
                                        ? new Date(
                                            session.date || session.datetime,
                                          ).toLocaleDateString("vi-VN")
                                        : "Chưa có ngày"}
                                  </span>
                                  <span className="mx-2">•</span>
                                  <span>
                                    {session.time ||
                                      (session.dateObj
                                        ? session.dateObj.toLocaleTimeString(
                                            [],
                                            {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                              hour12: false,
                                            },
                                          )
                                        : "--:--")}
                                  </span>
                                </div>

                                <div className="text-xs text-slate-400 mt-1">
                                  Gia sư:{" "}
                                  {tutor?.name ||
                                    session.tutorName ||
                                    "Đang cập nhật"}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              {/* <ImageWithFallback
                                src={tutor?.avatar || ""}
                                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                              /> */}

                              {/* <ImageWithFallback
                                src={
                                  tutor?.avatar
                                    ? tutor.avatar.startsWith("http")
                                      ? tutor.avatar
                                      : `http://localhost:3000${tutor.avatar}`
                                    : "https://i.pravatar.cc/150"
                                }
                                className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                              /> */}

                              <ImageWithFallback
                                src={
                                  tutor?.avatar
                                    ? getAvatarUrl(tutor.avatar)
                                    : "/img/images.jpg"
                                }
                                className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                              />

                              {/* {canJoin ? (
                                <Link
                                  to={`/room/${session.room_id}`}
                                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
                                >
                                  Vào phòng
                                </Link> */}
                              {canJoin ? (
                                <Link
                                  to={`/room/${session.room_id || session.roomId}`}
                                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
                                >
                                  Vào phòng
                                </Link>
                              ) : canReview ? (
                                <button
                                  onClick={() =>
                                    setFeedbackData({
                                      bookingId: session.id,
                                      targetUserId: session.tutorId,
                                      targetName:
                                        tutor?.name || session.tutorName,
                                      targetRole: "tutor",
                                      canReview: true,
                                    })
                                  }
                                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all"
                                >
                                  Đánh giá
                                </button>
                              ) : (
                                <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-400 cursor-not-allowed">
                                  {session.status === "cancelled"
                                    ? "Gia sư đã từ chối"
                                    : session.room_id || session.roomId
                                      ? "Chưa đến giờ"
                                      : "Chờ xác nhận"}
                                </button>
                              )}
                              {/* Thêm nút báo cáo */}
                              <button
                                onClick={() =>
                                  setFeedbackData({
                                    bookingId: session.id,
                                    targetUserId: session.tutorId,
                                    targetName:
                                      tutor?.name || session.tutorName,
                                    targetRole: "tutor",
                                    canReview,
                                  })
                                }
                                className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg"
                              >
                                Phản hồi
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "messages" && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900">
                      Tin nhắn gần đây
                    </h3>
                    <Link
                      to="/messages"
                      className="text-sm font-bold text-indigo-600 hover:underline"
                    >
                      Mở toàn màn hình
                    </Link>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {messages.length > 0 ? (
                      messages.map((conv) => (
                        <Link
                          key={conv.id}
                          to={`/messages?userId=${conv.id}`}
                          className="flex items-center p-6 hover:bg-slate-50 transition-all gap-4"
                        >
                          <div className="relative">
                            <ImageWithFallback
                              src={conv.avatar}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            {conv.unread > 0 && (
                              <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                {conv.unread}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-bold text-slate-900">
                                {conv.name}
                              </h4>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {conv.time
                                  ? new Date(conv.time).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : ""}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 line-clamp-1 truncate max-w-md">
                              {conv.lastMsg}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-300" />
                        </Link>
                      ))
                    ) : (
                      <div className="p-12 text-center">
                        <MessageSquare className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">
                          Chưa có tin nhắn nào
                        </p>
                        <Link
                          to="/search"
                          className="text-indigo-600 font-bold text-sm mt-2 inline-block"
                        >
                          Tìm gia sư để trò chuyện
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "favorites" && (
                <div className="grid md:grid-cols-2 gap-6">
                  {favorites.map((fav) => {
                    const tutor = fav;

                    if (!tutor) return null; // tránh crash

                    return (
                      <div
                        key={tutor.id}
                        className="bg-white rounded-3xl border border-slate-200 p-6 flex items-start space-x-4 shadow-sm"
                      >
                        <ImageWithFallback
                          src={getAvatarUrl(tutor?.avatar)}
                          className="w-16 h-16 rounded-2xl object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-slate-900">
                              {tutor.name}
                            </h4>
                            <button 
                              className="text-rose-500"
                              onClick={async () => {
                                try {
                                  await favoriteApi.removeFavorite(tutor.id);
                                  setFavorites(prev => prev.filter(f => f.id !== tutor.id));
                                } catch (e) {
                                  console.log(e);
                                }
                              }}
                            >
                              <Heart className="h-5 w-5 fill-current" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 mb-3">
                            {tutor.subjects?.[0]}
                          </p>
                          <Link
                            to={`/tutor/${tutor.id}`}
                            className="text-xs font-bold text-indigo-600 hover:underline"
                          >
                            Xem hồ sơ
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                  <Link
                    to="/search"
                    className="bg-slate-100 border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-slate-400 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all"
                  >
                    <Heart className="h-8 w-8 mb-2" />
                    <span className="font-bold">Thêm gia sư</span>
                  </Link>
                </div>
              )}

              {activeTab === "billing" && (
                <div className="space-y-6">
                  <div className="bg-slate-900 rounded-3xl p-8 text-white">
                    <h3 className="text-lg font-bold mb-6">Số dư ví</h3>
                    <div className="text-5xl font-extrabold mb-8">
                      ${wallet?.balance || 0}
                    </div>
                    <div className="flex space-x-4">
                      <button className="px-6 py-3 bg-indigo-600 rounded-2xl font-bold hover:bg-indigo-700 transition-all">
                        Nạp tiền
                      </button>
                      <button className="px-6 py-3 bg-white/10 rounded-2xl font-bold hover:bg-white/20 transition-all">
                        Lịch sử giao dịch
                      </button>
                    </div>
                  </div>
                  <div className="bg-white rounded-3xl border border-slate-200 p-8">
                    <h4 className="font-bold text-slate-900 mb-6">
                      Phương thức thanh toán đã lưu
                    </h4>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-8 bg-slate-200 rounded-md"></div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            ••• •••• •••• 4242
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Hết hạn 12/28
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 bg-indigo-100 text-indigo-600 rounded-md">
                        CHÍNH
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "wallet" && (
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100">
                    <div className="flex items-center gap-4">
                      <Wallet className="h-8 w-8 text-blue-600" />
                      <div>
                        <h3 className="text-lg font-bold text-blue-900">
                          Quản lý ví
                        </h3>
                        <p className="text-sm text-blue-700">
                          Nạp tiền, xem lịch sử giao dịch và settlements hàng
                          tuần
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/wallet"
                      className="mt-4 w-full px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all pointer-events-auto relative z-10 inline-block text-center"
                    >
                      Đi đến trang quản lý ví
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </main>
          {feedbackData && (
            <FeedbackMiniPage
              onClose={() => setFeedbackData(null)}
              bookingId={feedbackData.bookingId}
              targetUserId={feedbackData.targetUserId}
              targetName={feedbackData.targetName}
              targetRole={feedbackData.targetRole}
              canReview={feedbackData.canReview}
              onSubmitted={fetchData}
            />
          )}
        </div>
      </div>
    </div>
  );
}
