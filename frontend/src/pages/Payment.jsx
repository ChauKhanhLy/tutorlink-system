import React from "react";
import { useParams, useNavigate } from "react-router-dom";

export function Payment() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const handlePay = async () => {
    // 🔗 CALL BACKEND PAYMENT
    // await fetch("/api/payment", { method: "POST" })

    navigate(`/lesson/${bookingId}`);
  };

  return (
    <div className="max-w-xl mx-auto mt-20 p-6 bg-white rounded-2xl shadow">
      <h1 className="text-2xl font-bold mb-4">Thanh toán</h1>
      <p className="mb-6">Booking ID: {bookingId}</p>

      <button onClick={handlePay} className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700">
        Thanh toán ngay
      </button>
    </div>
  );
}
