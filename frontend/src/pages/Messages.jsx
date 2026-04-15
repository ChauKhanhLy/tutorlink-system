import React from "react";
import socket from "../socket";
import { Link } from "react-router-dom";
import {
  Search,
  MoreVertical,
  Send,
  Paperclip,
  Phone,
  Video,
  Info,
  CheckCheck,
  Smile,
  Clock,
  Star,
  MessageSquare,
} from "lucide-react";
import { ImageWithFallback } from "../components/Image/ImageWithFallback";
import messageApi from "../api/messageApi";

export function MessagesPage() {
  const [chats, setChats] = React.useState([]);
  const [loadingChats, setLoadingChats] = React.useState(true);
  const [activeChat, setActiveChat] = React.useState(null);
  const [message, setMessage] = React.useState("");
  const [messages, setMessages] = React.useState([]);
  const userId = "abc123"; // tạm thời, sau này lấy từ AuthContext

  const currentTutor = React.useMemo(() => {
    return chats.find((c) => c.id === activeChat) || null;
  }, [chats, activeChat]);

  const handleSend = () => {
    if (!message.trim() || !activeChat) return;

    const data = {
      sender_id: userId,
      receiver_id: activeChat,
      content: message,
    };

    socket.emit("send_message", data);
    setMessage("");
  };

  // Lấy danh sách cuộc trò chuyện
  React.useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoadingChats(true);
        const res = await messageApi.getConversations();
        setChats(res.data);
      } catch (err) {
        console.error("Lỗi tải danh sách chat:", err);
      } finally {
        setLoadingChats(false);
      }
    };
    fetchChats();
  }, []);

  // Lấy tin nhắn khi activeChat thay đổi
  React.useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
      try {
        const res = await messageApi.getMessages(userId, activeChat);
        setMessages(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();
  }, [activeChat, userId]);

  // Socket setup
  React.useEffect(() => {
    socket.emit("register_user", userId);

    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [userId]);

  // Tự động chọn chat đầu tiên
  React.useEffect(() => {
    if (chats.length > 0 && !activeChat) {
      setActiveChat(chats[0].id);
    }
  }, [chats, activeChat]);

  return (
    <div className="pt-20 h-screen bg-white flex overflow-hidden">
      {/* Sidebar: Danh sách tin nhắn */}
      <aside className="w-full md:w-80 lg:w-96 border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-6 border-b border-slate-100 bg-white">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-6">
            Tin nhắn
          </h1>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm cuộc trò chuyện..."
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loadingChats ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="text-sm font-medium">Đang tải cuộc trò chuyện...</p>
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8">
              <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm font-medium text-center">
                Bạn chưa có cuộc trò chuyện nào.
              </p>
              <Link
                to="/search"
                className="mt-4 text-indigo-600 font-bold text-sm hover:underline"
              >
                Tìm gia sư để nhắn tin
              </Link>
            </div>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                className={`w-full flex items-center p-4 transition-all border-b border-slate-50/50 ${
                  activeChat === chat.id
                    ? "bg-white shadow-sm ring-1 ring-slate-100 border-l-4 border-l-indigo-600"
                    : "hover:bg-slate-100/50"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
                    <ImageWithFallback
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {chat.online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white rounded-full"></div>
                  )}
                </div>
                <div className="ml-4 flex-1 text-left min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-900 truncate pr-4">
                      {chat.name}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
                      {chat.time}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p
                      className={`text-xs truncate ${
                        chat.unread
                          ? "font-bold text-slate-900"
                          : "text-slate-500 font-medium"
                      }`}
                    >
                      {chat.lastMsg}
                    </p>
                    {chat.unread > 0 && (
                      <span className="ml-2 w-5 h-5 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-[10px] font-bold shadow-lg shadow-indigo-500/30">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Khu vực chat chính */}
      <main className="flex-1 flex flex-col bg-white">
        {activeChat && currentTutor ? (
          <>
            {/* Header chat */}
            <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                  <ImageWithFallback
                    src={currentTutor?.avatar}
                    alt={currentTutor?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">
                    {currentTutor?.name}
                  </h2>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>{" "}
                    Đang hoạt động
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-slate-100">
                  <Phone className="h-5 w-5" />
                </button>
                <button className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-slate-100">
                  <Video className="h-5 w-5" />
                </button>
                <div className="w-px h-6 bg-slate-100 mx-2"></div>
                <button className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100">
                  <Info className="h-5 w-5" />
                </button>
              </div>
            </header>

            {/* Danh sách tin nhắn */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 custom-scrollbar">
              <div className="flex justify-center mb-8">
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest shadow-sm">
                  11 tháng 3, 2026
                </span>
              </div>

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender_id === userId ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="max-w-[75%]">
                    <div
                      className={`px-5 py-3.5 rounded-3xl text-sm ${
                        msg.sender_id === userId
                          ? "bg-indigo-600 text-white"
                          : "bg-white text-slate-700"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Ô nhập tin nhắn */}
            <footer className="p-6 border-t border-slate-100">
              <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-2 flex items-center space-x-2 focus-within:ring-2 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all">
                <button className="p-3 text-slate-400 hover:text-indigo-600 transition-colors">
                  <Paperclip className="h-5 w-5" />
                </button>
                <input
                  type="text"
                  placeholder="Nhập tin nhắn của bạn..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm font-medium text-slate-900 px-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                />
                <button className="p-3 text-slate-400 hover:text-indigo-600 transition-colors">
                  <Smile className="h-5 w-5" />
                </button>
                <button
                  onClick={handleSend}
                  className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageSquare className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">Chọn một cuộc trò chuyện</p>
            <p className="text-sm">hoặc bắt đầu nhắn tin với gia sư mới</p>
            <Link
              to="/search"
              className="mt-6 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all"
            >
              Tìm gia sư
            </Link>
          </div>
        )}
      </main>

      {/* Sidebar phải: Thông tin nhanh gia sư (chỉ trên desktop) */}
      {activeChat && currentTutor && (
        <aside className="hidden lg:flex w-80 border-l border-slate-100 flex-col bg-white">
          <div className="p-8 text-center flex-1">
            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden mx-auto mb-6 shadow-2xl shadow-indigo-500/10 border-4 border-slate-50">
              <ImageWithFallback
                src={currentTutor.avatar}
                alt={currentTutor.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-1">
              {currentTutor.name}
            </h3>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-6">
              Gia sư {currentTutor.subjects?.[0]}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Đánh giá
                </div>
                <div className="text-lg font-extrabold text-slate-900 flex items-center justify-center">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500 mr-1.5" />{" "}
                  {currentTutor.rating}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Giờ
                </div>
                <div className="text-lg font-extrabold text-slate-900">
                  ${currentTutor.hourlyRate}
                </div>
              </div>
            </div>

            <div className="space-y-4 text-left">
              <h4 className="text-sm font-bold text-slate-900 px-1">
                Buổi học sắp tới
              </h4>
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start space-x-3">
                <Clock className="h-5 w-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-indigo-900">
                    Ngày mai, 10:00 SA
                  </p>
                  <p className="text-[10px] font-medium text-indigo-600">
                    Buổi học 50 phút • Trực tuyến
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-slate-50">
            <Link
              to={`/tutor/${currentTutor.id}`}
              className="w-full py-4 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 hover:border-slate-200 hover:bg-slate-50 transition-all block text-center"
            >
              Xem hồ sơ đầy đủ
            </Link>
          </div>
        </aside>
      )}
    </div>
  );
}