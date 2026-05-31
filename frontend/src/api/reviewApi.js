import axiosClient from "./axiosClient";

const normalizeReview = (review) => ({
  ...review,
  id: review?.id,
  bookingId: review?.booking_id || review?.bookingId,
  reviewerId: review?.reviewer_id || review?.reviewerId,
  createdAt: review?.created_at || review?.createdAt,
});

export const reviewApi = {
  getByTutor: async (tutorId) => {
    const res = await axiosClient.get(`/reviews?tutorId=${tutorId}`);
    const raw = res?.data?.data || [];
    return {
      ...res,
      data: raw.map(normalizeReview),
    };
  },

  getByBooking: async (bookingId) => {
    const res = await axiosClient.get(`/reviews/booking?bookingId=${bookingId}`);
    const raw = res?.data?.data || [];
    return {
      ...res,
      data: raw.map(normalizeReview),
    };
  },

  create: (data) =>
    axiosClient.post("/reviews", {
      booking_id: data?.booking_id || data?.bookingId,
      tutor_id: data?.tutor_id || data?.tutorId,
      subject_id: data?.subject_id || data?.subjectId,
      review_type: data?.review_type || data?.reviewType || 'session',
      rating: data?.rating,
      comment: data?.comment,
    }),
};