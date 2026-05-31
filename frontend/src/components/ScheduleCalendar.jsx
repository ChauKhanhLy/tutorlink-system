import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ScheduleCalendar({ sessions }) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Lấy thứ của ngày 1 (0: CN, 1: T2, ..., 6: T7)
  let startDay = firstDay.getDay();
  // Chuyển sang định dạng T2=0, ..., CN=6
  startDay = startDay === 0 ? 6 : startDay - 1;

  const daysInMonth = lastDay.getDate();
  const calendarDays = [];

  // Ô trống đầu tháng
  for (let i = 0; i < startDay; i++) {
    calendarDays.push({ type: "empty" });
  }

  // Các ngày trong tháng
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const daySessions = sessions.filter((s) => {
      // s.dateObj đã được normalizeBooking xử lý
      if (!s.dateObj) {
         // Fallback cho trường hợp dateObj bị thiếu
         const fallbackDate = new Date(s.datetime || s.date);
         return (
            fallbackDate.getFullYear() === year &&
            fallbackDate.getMonth() === month &&
            fallbackDate.getDate() === d
         );
      }
      const sDate = s.dateObj;
      return (
        sDate.getFullYear() === year &&
        sDate.getMonth() === month &&
        sDate.getDate() === d
      );
    });
    calendarDays.push({ type: "day", day: d, dateStr, sessions: daySessions });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800 capitalize text-center flex-1">
          {currentMonth.toLocaleDateString("vi-VN", {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const prev = new Date(currentMonth);
              prev.setMonth(prev.getMonth() - 1);
              setCurrentMonth(prev);
            }}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => {
              const next = new Date(currentMonth);
              next.setMonth(next.getMonth() + 1);
              setCurrentMonth(next);
            }}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"].map(
          (d) => (
            <div
              key={d}
              className="bg-slate-50 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest"
            >
              {d}
            </div>
          ),
        )}

        {calendarDays.map((item, idx) => (
          <div
            key={idx}
            className={`min-h-[100px] bg-white p-2 ${
              item.type === "empty" ? "bg-slate-50/30" : ""
            }`}
          >
            {item.type === "day" && (
              <>
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`text-xs font-bold ${
                      new Date().toISOString().split("T")[0] === item.dateStr
                        ? "w-6 h-6 flex items-center justify-center bg-indigo-600 text-white rounded-full shadow-md"
                        : "text-slate-400"
                    }`}
                  >
                    {item.day}
                  </span>
                </div>
                <div className="space-y-1">
                  {item.sessions.map((s) => (
                    <div
                      key={s.id}
                      className={`p-1.5 rounded-lg border text-[9px] font-bold truncate transition-all cursor-pointer hover:shadow-sm ${
                        s.status === "confirmed"
                          ? "bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100"
                          : s.status === "cancelled" || s.status === "cancel" 
                            ? "bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100"
                            : "bg-amber-50 border-amber-100 text-amber-700 hover:bg-amber-100"
                      }`}
                      title={`${s.time} - ${s.subject || s.tutorName} (${s.status})`}
                    >
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-1 h-1 rounded-full ${
                            s.status === "confirmed"
                              ? "bg-emerald-500"
                              : s.status === "cancelled" || s.status === "cancel"
                                ? "bg-rose-500"
                                : "bg-amber-500"
                          }`}
                        />
                        <span className="opacity-70">{s.time}</span>
                      </div>
                      <div className="truncate">{s.tutorName || s.studentName}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
