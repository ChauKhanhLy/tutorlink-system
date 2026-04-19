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
  const { id } = useParams(); // room ID (có thể là booking_id hoặc room_id)
  const navigate = useNavigate();
  const { user } = useAuth();

  const [room, setRoom] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [micEnabled, setMicEnabled] = React.useState(true);
  const [videoEnabled, setVideoEnabled] = React.useState(true);
  const [screenSharing, setScreenSharing] = React.useState(false);
  const [showChat, setShowChat] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [connectionQuality, setConnectionQuality] = React.useState("good"); // good, poor, lost

  // Giả lập stream video (thực tế sẽ dùng WebRTC)
  const localVideoRef = React.useRef(null);
  const remoteVideoRef = React.useRef(null);

  React.useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await videoRoomApi.getRoom(id);
        setRoom(res.data);
        
        // Kiểm tra thời gian có thể join không
        const now = new Date();
        const start = new Date(res.data.start_time);
        const end = new Date(res.data.end_time);
        
        if (res.data.status === 'cancelled') {
          toast.error("Buổi học đã bị hủy");
          navigate('/dashboard');
          return;
        }
        if (res.data.status === 'ended' || now > end) {
          toast.error("Buổi học đã kết thúc");
          navigate('/dashboard');
          return;
        }
        // Không chặn nếu chưa đến giờ, chỉ cảnh báo
        if (now < start) {
          toast.warning("Buổi học chưa bắt đầu, bạn có thể vào phòng chờ");
        }
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải thông tin phòng");
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id, navigate]);

  // Giả lập kết nối video (thực tế sẽ khởi tạo peer connection)
  React.useEffect(() => {
    if (!room) return;
    
    // Yêu cầu quyền camera/mic
    navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.warn("Không thể truy cập camera/mic:", err);
        toast.error("Vui lòng cấp quyền camera và micro");
      });

    // Giả lập remote stream (có thể là video tĩnh)
    // Trong thực tế sẽ nhận từ WebRTC
  }, [room]);

  const handleToggleMic = () => {
    const stream = localVideoRef.current?.srcObject;
    if (stream) {
      stream.getAudioTracks().forEach(track => track.enabled = !micEnabled);
    }
    setMicEnabled(!micEnabled);
  };

  const handleToggleVideo = () => {
    const stream = localVideoRef.current?.srcObject;
    if (stream) {
      stream.getVideoTracks().forEach(track => track.enabled = !videoEnabled);
    }
    setVideoEnabled(!videoEnabled);
  };

  const handleScreenShare = async () => {
    try {
      if (!screenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideoRef.current) {
          // Thay thế video track bằng screen track
          const videoTrack = screenStream.getVideoTracks()[0];
          const stream = localVideoRef.current.srcObject;
          const oldVideoTrack = stream.getVideoTracks()[0];
          stream.removeTrack(oldVideoTrack);
          stream.addTrack(videoTrack);
          localVideoRef.current.srcObject = stream;
        }
        setScreenSharing(true);
        toast.success("Đang chia sẻ màn hình");
      } else {
        // Dừng chia sẻ, quay lại camera
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoTrack = stream.getVideoTracks()[0];
        const currentStream = localVideoRef.current.srcObject;
        const oldTrack = currentStream.getVideoTracks()[0];
        currentStream.removeTrack(oldTrack);
        currentStream.addTrack(videoTrack);
        localVideoRef.current.srcObject = currentStream;
        setScreenSharing(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể chia sẻ màn hình");
    }
  };

  const handleEndCall = async () => {
    if (confirm("Bạn có chắc muốn kết thúc buổi học?")) {
      try {
        await videoRoomApi.updateStatus(id, 'ended');
        toast.success("Đã kết thúc buổi học");
        navigate('/dashboard');
      } catch (err) {
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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Đang vào phòng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-slate-400 hover:text-white">
            ← Rời phòng
          </Link>
          <div className="h-6 w-px bg-slate-700"></div>
          <div className="flex items-center gap-3">
            <ImageWithFallback
              src={room?.tutor?.avatar}
              alt={room?.tutor?.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <h2 className="font-bold">{room?.tutor?.name}</h2>
              <p className="text-xs text-slate-400">{room?.subject || "Buổi học"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Shield className="h-4 w-4 text-indigo-400" />
            <span className="text-xs text-slate-400">Mã hóa đầu cuối</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            {connectionQuality === 'good' && <Wifi className="h-4 w-4 text-green-400" />}
            {connectionQuality === 'poor' && <Wifi className="h-4 w-4 text-yellow-400" />}
            {connectionQuality === 'lost' && <WifiOff className="h-4 w-4 text-red-400" />}
            <span className="text-slate-400">
              {new Date(room?.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
              {new Date(room?.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <button
            onClick={copyRoomLink}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition"
          >
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? "Đã sao chép" : "Sao chép link"}</span>
          </button>
          <button
            onClick={() => setShowChat(!showChat)}
            className="p-2 hover:bg-slate-700 rounded-lg transition"
          >
            <MessageSquare className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-lg transition">
            <Users className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main content: Video grid */}
      <div className="flex-1 flex overflow-hidden">
        <div className={`flex-1 p-4 ${showChat ? 'pr-80' : ''} transition-all`}>
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Local video */}
            <div className="relative bg-slate-800 rounded-2xl overflow-hidden border border-slate-700">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover mirror"
              />
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm">
                Bạn {user?.name}
              </div>
              {!videoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80">
                  <VideoOff className="h-12 w-12 text-slate-400" />
                </div>
              )}
            </div>

            {/* Remote video */}
            <div className="relative bg-slate-800 rounded-2xl overflow-hidden border border-slate-700">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm">
                {room?.tutor?.name} (Gia sư)
              </div>
              {/* Giả lập video nếu chưa có stream */}
              {!remoteVideoRef.current?.srcObject && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                  <ImageWithFallback
                    src={room?.tutor?.avatar}
                    alt={room?.tutor?.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500/30"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat sidebar (tùy chọn) */}
        {showChat && (
          <div className="w-80 border-l border-slate-700 bg-slate-800/50 backdrop-blur-sm flex flex-col">
            <div className="p-4 border-b border-slate-700">
              <h3 className="font-bold">Tin nhắn trong phòng</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="text-center text-xs text-slate-500">Chưa có tin nhắn</div>
            </div>
            <div className="p-4 border-t border-slate-700">
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Control bar */}
      <div className="py-4 px-6 bg-slate-800/80 backdrop-blur-sm border-t border-slate-700">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleToggleMic}
            className={`p-4 rounded-full transition ${
              micEnabled ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {micEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </button>
          <button
            onClick={handleToggleVideo}
            className={`p-4 rounded-full transition ${
              videoEnabled ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {videoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
          </button>
          <button
            onClick={handleScreenShare}
            className={`p-4 rounded-full transition ${
              screenSharing ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            <ScreenShare className="h-6 w-6" />
          </button>
          <button
            onClick={handleEndCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition"
          >
            <PhoneOff className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}