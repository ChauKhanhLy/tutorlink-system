import axiosClient from "./axiosClient";

const normalizeBooking = (booking) => {
  const datetime = booking?.datetime || booking?.startTime || booking?.date;
  const dateObj = datetime ? new Date(datetime) : null;

  return {
    ...booking,
    id: booking?.id,
    tutorId: booking?.tutor_id || booking?.tutorId,
    learnerId: booking?.learner_id || booking?.learnerId,
    status: booking?.status,
    date: dateObj ? dateObj.toISOString() : null,
    time: dateObj
      ? dateObj.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      : "",
    startTime: dateObj ? dateObj.toISOString() : null,
  };
};

export const bookingApi = {
  create: (data) =>
    axiosClient.post("/bookings", {
      tutor_id: data?.tutor_id || data?.tutorId,
      datetime: data?.datetime || data?.startTime,
      fee: data?.fee ?? 0,
      subject_id: data?.subject_id || data?.subjectId || data?.tutorId || data?.tutor_id,
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
};