import axiosClient from "./axiosClient";

const normalizeBooking = (booking) => {
  const rawDatetime = booking?.datetime || booking?.startTime || booking?.date;
  if (!rawDatetime) return booking;

  let dateObj;
  
  if (rawDatetime instanceof Date) {
    dateObj = rawDatetime;
  } else {
    let dateStr = String(rawDatetime).trim();
    
    // Xử lý định dạng PostgreSQL: "2024-05-11 03:00:00+00" hoặc "2024-05-11 03:00:00"
    if (dateStr.includes(' ')) {
      dateStr = dateStr.replace(' ', 'T');
    }
    
    // Database trả về timestamp với timezone, giữ nguyên để xử lý đúng
    // Không ép thành UTC nữa để tránh lệch giờ
    dateObj = new Date(dateStr);
  }

  const isValidDate = !isNaN(dateObj.getTime());
  
  return {
    ...booking,
    id: booking?.id,
    tutorId: booking?.tutor_id || booking?.tutorId,
    learnerId: booking?.learner_id || booking?.learnerId,
    status: booking?.status,
    dateObj: isValidDate ? dateObj : null,
    isoDate: isValidDate ? dateObj.toISOString() : null,
    time: isValidDate
      ? dateObj.toLocaleTimeString("vi-VN", { 
          hour: "2-digit", 
          minute: "2-digit", 
          hour12: false,
          timeZone: "Asia/Ho_Chi_Minh" 
        })
      : "",
    startTime: isValidDate ? dateObj.toISOString() : null,
  };
};

export const bookingApi = {
  create: (data) =>
    axiosClient.post("/bookings", {
      tutor_id: data?.tutor_id || data?.tutorId,
      datetime: data?.datetime || data?.startTime,
      fee: data?.fee ?? 0,
      type: data?.type || "regular",
      subject_id: data?.subject_id || data?.subjectId,
    }),

  getMyBookings: async () => {
    const res = await axiosClient.get("/bookings");
    const raw = res?.data?.data || [];
    return {
      ...res,
      data: raw.map(normalizeBooking),
    };
  },

  getTutorBookings: async () => {
    const res = await axiosClient.get("/bookings");
    const raw = res?.data?.data || [];
    return {
      ...res,
      data: raw.map(normalizeBooking),
    };
  },

  cancel: (bookingId) => axiosClient.patch(`/bookings/${bookingId}/cancel`),

  accept: (bookingId) => axiosClient.patch(`/bookings/${bookingId}/accept`),

  reject: (bookingId) => axiosClient.patch(`/bookings/${bookingId}/reject`),
};