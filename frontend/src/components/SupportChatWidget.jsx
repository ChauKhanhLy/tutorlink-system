import React from "react";
import { MessageCircle, X, Send, Paperclip, Smile } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import socket from "../socket";
import messageApi from "../api/messageApi";
import { ImageWithFallback } from "./Image/ImageWithFallback";

export function SupportChatWidget() {
  const { user } = useAuth();

  // 🔥 TẤT CẢ HOOK PHẢI ĐƯỢC GỌI TRƯỚC MỌI RETURN
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState([]);
  const [inputMessage, setInputMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [conversationId, setConversationId] = React.useState(null);
  const messagesEndRef = React.useRef(null);
  const [adminId, setAdminId] = React.useState(null);

  // Lấy ID của admin
  React.useEffect(() => {
    const fetchAdminId = async () => {
      try {
        const res = await messageApi.getAdminId();
        setAdminId(res.adminId);
      } catch (err) {
        console.error("Lỗi khi lấy ID admin:", err);
      }
    };
    fetchAdminId();
  }, []);

  // Khởi tạo cuộc trò chuyện với admin
  React.useEffect(() => {
    if (!isOpen || !user?.id) return;
    const initConversation = async () => {
      try {
        setLoading(true);
        const res = await messageApi.getOrCreateSupportConversation(user.id);
        const conv = res.data;
        setConversationId(conv.id);
        const msgRes = await messageApi.getMessages(user.id, adminId);
        setMessages(msgRes.data || []);
      } catch (err) {
        console.error("Lỗi khởi tạo chat hỗ trợ:", err);
      } finally {
        setLoading(false);
      }
    };
    initConversation();
  }, [isOpen, user?.id, adminId]);

  // Socket nhận tin nhắn
  React.useEffect(() => {
    if (!user?.id) return;
    socket.emit("register_user", user.id);
    const handleReceiveMessage = (msg) => {
      if (
        (msg.sender_id === adminId && msg.receiver_id === user.id) ||
        (msg.sender_id === user.id && msg.receiver_id === adminId)
      ) {
        setMessages((prev) => {
          const exists = prev.some(
            (m) => m.id === msg.id || m.tempId === msg.tempId,
          );
          if (exists) return prev;
          return [...prev, msg];
        });
      }
    };
    socket.on("receive_message", handleReceiveMessage);
    return () => socket.off("receive_message", handleReceiveMessage);
  }, [user?.id, adminId]);

  // Cuộn xuống cuối
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  React.useEffect(() => {
    if (!user) {
      setMessages([]);
      setConversationId(null);
      setIsOpen(false);
    }
  }, [user]);

  // ✅ KIỂM TRA ROLE SAU KHI TẤT CẢ HOOK ĐÃ ĐƯỢC GỌI
  if (user?.role === "admin") return null;

  const handleSend = () => {
    if (!inputMessage.trim() || !user?.id) return;
    const tempId = `temp-${Date.now()}`;
    const newMsg = {
      id: tempId,
      tempId,
      sender_id: user.id,
      receiver_id: adminId,
      content: inputMessage,
      sent_at: new Date().toISOString(),
      pending: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputMessage("");
    socket.emit("send_message", {
      sender_id: user.id,
      receiver_id: adminId,
      content: inputMessage,
    });
  };
  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-indigo-700 transition-all hover:scale-105"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 h-[550px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-indigo-600 text-white">
            <h3 className="font-bold">Hỗ trợ TutorLink</h3>
            <p className="text-xs text-indigo-100">
              Chúng tôi thường trả lời trong vài phút
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {loading ? (
              <div className="text-center py-8 text-slate-400">Đang tải...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Chào bạn! Hãy gửi câu hỏi cho chúng tôi.</p>
              </div>
            ) : (
              messages.map((msg) => {
                if (!msg || !user) return null;
                const isMe = msg.sender_id === user.id;
                return (
                  <div
                    key={msg.id || msg.tempId}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div className="max-w-[80%]">
                      {!isMe && (
                        <div className="flex items-center gap-2 mb-1">
                          <ImageWithFallback
                            src="/admin-avatar.png"
                            alt="Admin"
                            className="w-5 h-5 rounded-full"
                          />
                          <span className="text-xs font-medium text-slate-600">
                            Admin
                          </span>
                        </div>
                      )}
                      <div
                        className={`px-4 py-2 rounded-2xl text-sm ${
                          isMe
                            ? "bg-indigo-600 text-white rounded-br-none"
                            : "bg-white text-slate-700 rounded-bl-none shadow-sm border border-slate-200"
                        }`}
                      >
                        {msg.content}
                        {msg.pending && (
                          <span className="ml-2 text-xs opacity-70">●</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 ml-2">
                        {new Date(msg.sent_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 border-t border-slate-100 bg-white">
            <div className="flex items-center gap-1">
              <button
                className="p-2 text-slate-400 hover:text-indigo-600"
                onClick={() => alert("Tính năng đính kèm sẽ có sau")}
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                className="p-2 text-slate-400 hover:text-indigo-600"
                onClick={() => alert("Tính năng biểu tượng cảm xúc sẽ có sau")}
              >
                <Smile className="h-4 w-4" />
              </button>
              <button
                onClick={handleSend}
                disabled={!inputMessage.trim()}
                className="p-2 bg-indigo-600 text-white rounded-full disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
