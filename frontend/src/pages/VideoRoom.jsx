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

  // States cho việc ghi hình
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);

  const jitsiContainerRef = React.useRef(null);
  const apiRef = React.useRef(null);

  // Refs phục vụ ghi hình
  const mediaRecorderRef = React.useRef(null);
  const streamRef = React.useRef(null);
  const chunksRef = React.useRef([]);
  const timerRef = React.useRef(null);

  // Bộ đếm thời gian ghi hình
  React.useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

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
      cleanupStreams();
    };
  }, [id, navigate]);

  // Logic WebRTC Recording
  const startRecording = async () => {
    try {
      toast.info(
        "Mẹo: Hãy chọn ghi 'Tab hiện tại' và bấm tích chọn 'Chia sẻ âm thanh của tab' ở góc dưới popup để ghi được âm thanh phòng học!",
        { duration: 6000 }
      );

      // 1. Capture tab trình duyệt hiện tại và âm thanh tab
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "browser",
          width: 1280,
          height: 720,
          frameRate: 30,
        },
        audio: true,
      });

      // 2. Capture micro của chính user hiện tại
      let audioStream = null;
      try {
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        console.warn("Không bật được micro để ghi âm giọng nói của bạn:", err);
      }

      // 3. Trộn âm thanh (Mic + Tab Audio) sử dụng Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const dest = audioContext.createMediaStreamDestination();
      let hasAudio = false;

      if (displayStream.getAudioTracks().length > 0) {
        const source1 = audioContext.createMediaStreamSource(
          new MediaStream([displayStream.getAudioTracks()[0]])
        );
        source1.connect(dest);
        hasAudio = true;
      }

      if (audioStream && audioStream.getAudioTracks().length > 0) {
        const source2 = audioContext.createMediaStreamSource(audioStream);
        source2.connect(dest);
        hasAudio = true;
      }

      // 4. Tổ hợp tracks thành stream mới
      const videoTrack = displayStream.getVideoTracks()[0];
      const mixedTracks = [videoTrack];

      if (hasAudio) {
        mixedTracks.push(dest.stream.getAudioTracks()[0]);
      } else if (audioStream && audioStream.getAudioTracks().length > 0) {
        mixedTracks.push(audioStream.getAudioTracks()[0]);
      }

      const mixedStream = new MediaStream(mixedTracks);

      streamRef.current = {
        displayStream,
        audioStream,
        mixedStream,
        audioContext,
      };

      chunksRef.current = [];

      // 5. Tạo MediaRecorder
      const options = { mimeType: "video/webm;codecs=vp9,opus" };
      let recorder;
      try {
        recorder = new MediaRecorder(mixedStream, options);
      } catch (e) {
        try {
          recorder = new MediaRecorder(mixedStream, { mimeType: "video/webm" });
        } catch (err) {
          recorder = new MediaRecorder(mixedStream);
        }
      }

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Tự động kích hoạt lưu trữ khi dừng ghi
      recorder.onstop = async () => {
        await uploadRecordingFile();
      };

      // Nếu người dùng nhấn dừng chia sẻ tab qua thanh popup của trình duyệt
      videoTrack.onended = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(1000); // Đẩy data mỗi 1 giây
      setIsRecording(true);
      toast.success("🔴 Đang ghi hình buổi học!");
    } catch (err) {
      console.error("Lỗi khởi tạo ghi hình:", err);
      toast.error("Không thể ghi hình. Vui lòng thử lại và cấp quyền chia sẻ màn hình.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadRecordingFile = async () => {
    if (chunksRef.current.length === 0) {
      cleanupStreams();
      return;
    }

    setIsUploading(true);
    const videoBlob = new Blob(chunksRef.current, { type: "video/webm" });
    cleanupStreams();

    try {
      const formData = new FormData();
      formData.append("video", videoBlob, "recording.webm");
      formData.append("duration_minutes", Math.ceil(recordingTime / 60));

      toast.info("Đang lưu trữ và tải video ghi hình lên máy chủ... Vui lòng không đóng tab!");

      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_BASE_URL ;
      
      const response = await fetch(`${apiUrl}/video-rooms/${id}/record`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Tải bản ghi lên máy chủ thất bại.");
      }

      toast.success("🎉 Đã lưu bản ghi hình buổi học thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải bản ghi lên server: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const cleanupStreams = () => {
    if (streamRef.current) {
      const { displayStream, audioStream, audioContext } = streamRef.current;
      if (displayStream) {
        displayStream.getTracks().forEach((t) => t.stop());
      }
      if (audioStream) {
        audioStream.getTracks().forEach((t) => t.stop());
      }
      if (audioContext && audioContext.state !== "closed") {
        audioContext.close().catch(console.error);
      }
      streamRef.current = null;
    }
  };

  const handleEndCall = async () => {
    if (confirm("Bạn có chắc muốn kết thúc buổi học?")) {
      try {
        console.log("Ending call for room:", id);

        // Nếu đang ghi hình, dừng ghi và tải lên trước khi redirect
        if (isRecording) {
          toast.info("Đang dừng ghi hình và lưu video...");
          setIsRecording(false);
          mediaRecorderRef.current.onstop = async () => {
            await uploadRecordingFile();
            await videoRoomApi.updateStatus(id, "ended");
            toast.success("Đã kết thúc buổi học và lưu bản ghi hình!");
            navigate("/dashboard");
          };
          mediaRecorderRef.current.stop();
          return;
        }

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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white overflow-hidden relative">
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

          {/* Nút Ghi hình Buổi học */}
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-xs md:text-sm transition animate-pulse font-bold border border-red-500 shadow-lg shadow-red-600/30"
              title="Dừng ghi hình"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-white block"></span>
              <span>Đang ghi {formatTime(recordingTime)}</span>
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs md:text-sm transition font-medium border border-slate-600/50 shadow-md"
              title="Ghi hình buổi học"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 block animate-ping"></span>
              <span>Ghi hình</span>
            </button>
          )}

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

      {/* Overlay Uploading */}
      {isUploading && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-50 transition-all duration-300">
          <div className="text-center p-8 bg-slate-900/80 border border-slate-700/50 rounded-3xl shadow-2xl max-w-sm mx-auto">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-xl font-bold text-white mb-2">Đang tải bản ghi lên</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Hệ thống đang mã hóa và lưu trữ video ghi hình buổi học của bạn. Vui lòng không đóng trình duyệt hoặc tải lại trang lúc này.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}