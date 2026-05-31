import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  ScreenShare,
  MessageSquare,
  Users,
  Copy,
  Check,
  Shield,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { videoRoomApi } from "../api/videoRoomApi";
import { useAuth } from "../context/AuthContext";
import { ImageWithFallback } from "../components/Image/ImageWithFallback";

export function VideoRoomPage() {
  const { id } = useParams(); // room ID (primary key của video_sessions)
  const navigate = useNavigate();
  const { user } = useAuth();

  const [room, setRoom] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [micEnabled, setMicEnabled] = React.useState(true);
  const [videoEnabled, setVideoEnabled] = React.useState(true);
  const [showChat, setShowChat] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [connectionQuality, setConnectionQuality] = React.useState("good");
  const [isJoined, setIsJoined] = React.useState(false);

  const jitsiContainerRef = React.useRef(null);
  const apiRef = React.useRef(null);

  React.useEffect(() => {
    const initRoom = async () => {
      try {
        const res = await videoRoomApi.getRoom(id);
        if (!res.data) {
          toast.error("Phòng học không tồn tại hoặc đã bị xóa");
          navigate("/dashboard");
          return;
        }
        setRoom(res.data);

        // Cập nhật trạng thái ongoing trên backend
        videoRoomApi.joinRoom(id).catch(console.error);

        // Xin quyền camera + mic trước
        try {
          await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
        } catch (err) {
          toast.error("Bạn cần cấp quyền camera và micro để tham gia");
          console.error(err);
          return; // ❗ Dừng luôn, không init Jitsi
        }

        // Load Jitsi script
        const domain = "meet.jit.si";
        if (!window.JitsiMeetExternalAPI) {
          await new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = `https://${domain}/external_api.js`;
            script.async = true;
            script.onload = resolve;
            document.body.appendChild(script);
          });
        }

        // Sử dụng dữ liệu trực tiếp từ response vì state 'room' chưa cập nhật ngay
        const roomData = res.data;
        const roomName = roomData.room_id || `tutorlink-${roomData.booking_id}`;

        const options = {
          roomName: roomName,
          width: "100%",
          height: "100%",
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: user?.name || "Người dùng",
          },
          configOverwrite: {
            prejoinPageEnabled: false,
            enableLobby: false,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableInviteFunctions: true,
            doNotStoreRoom: true,
          },
        };

        // Dọn dẹp container trước khi tạo mới để tránh bị lặp màn hình
        if (jitsiContainerRef.current) {
          jitsiContainerRef.current.innerHTML = "";
        }

        apiRef.current = new window.JitsiMeetExternalAPI(domain, options);
        setIsJoined(true);
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Lỗi khởi tạo phòng học");
        navigate("/dashboard");
      }
    };

    initRoom();

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [id, navigate]);

  const handleEndCall = async () => {
    if (confirm("Bạn có chắc muốn kết thúc buổi học?")) {
      try {
        console.log("Ending call for room:", id);
        await videoRoomApi.updateStatus(id, "ended");
        toast.success("Đã kết thúc buổi học");
        navigate("/dashboard");
      } catch (err) {
        console.error(err);
        toast.error("Lỗi khi kết thúc");
      }
    }
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Đã sao chép link phòng");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 z-10">
        <div className="flex items-center gap-4">
             {user?.role === "admin" ? (
                <Link
                  to="/admin/bookings"
                  className="text-slate-400 hover:text-white flex items-center gap-2"
                >
                  ← <span className="hidden md:inline">Rời phòng</span>
                </Link>
              ) : (
          <Link
            to="/dashboard"
            className="text-slate-400 hover:text-white flex items-center gap-2"
          >
            ← <span className="hidden md:inline">Rời phòng</span>
          </Link>)}
          <div className="h-6 w-px bg-slate-700 hidden md:block"></div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <h2 className="font-bold text-sm md:text-base">
                Phòng học trực tuyến
              </h2>
              <p className="text-[10px] md:text-xs text-slate-400">
                ID: {room?.room_id}
              </p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-2 ml-4">
            <Shield className="h-4 w-4 text-indigo-400" />
            <span className="text-xs text-slate-400">Kết nối an toàn</span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs">
            {connectionQuality === "good" && (
              <Wifi className="h-4 w-4 text-green-400" />
            )}
            <span className="text-slate-400">
              {room?.start_time
                ? new Date(room.start_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}{" "}
              -
              {room?.end_time
                ? new Date(room.end_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </span>
          </div>
          <button
            onClick={copyRoomLink}
            className="flex items-center gap-1 px-2 md:px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs md:text-sm transition"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {copied ? "Đã sao chép" : "Sao chép link"}
            </span>
          </button>
          <button
            onClick={handleEndCall}
            className="bg-red-600 hover:bg-red-700 p-2 rounded-lg transition"
            title="Kết thúc buổi học"
          >
            <PhoneOff className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main content: Jitsi container */}
      <div className="flex-1 relative bg-black">
        <div
          ref={jitsiContainerRef}
          id="jitsi-container"
          className="w-full h-full"
        ></div>

        {!isJoined && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-0">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p>Đang chuẩn bị phòng học...</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="py-2 px-6 bg-slate-800/80 backdrop-blur-sm border-t border-slate-700 text-[10px] text-slate-500 text-center">
        Powered by Jitsi Meet • TutorLink System Video Room
      </div>
    </div>
  );
}
