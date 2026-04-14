import React from "react";
import { useParams } from "react-router-dom";

export function Review() {
  const { bookingId } = useParams();
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState("");

  const submitReview = async () => {
    // 🔗 CALL BACKEND
    console.log({ bookingId, rating, comment });
  };

  return (
    <div className="max-w-xl mx-auto mt-20 p-6 bg-white rounded-2xl shadow">
      <h1 className="text-2xl font-bold mb-4">Đánh giá</h1>

      <input type="number" value={rating} onChange={(e) => setRating(e.target.value)} className="border p-2 mb-4 w-full" />
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="border p-3 w-full mb-4" placeholder="Nhận xét..."></textarea>

      <button onClick={submitReview} className="w-full bg-indigo-600 text-white py-3 rounded-xl">
        Gửi đánh giá
      </button>
    </div>
  );
}