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

  create: (data) =>
    axiosClient.post("/reviews", {
      booking_id: data?.booking_id || data?.bookingId,
      rating: data?.rating,
      comment: data?.comment,
    }),
};