import React from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Booking() {
  const { tutorId } = useParams();
  const navigate = useNavigate();

  const handleBooking = () => {
    const bookingId = Date.now();
    navigate(`/payment/${bookingId}`);
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Đặt lịch với Tutor #{tutorId}</h1>
      <input type="date" className="border p-2 mb-4 block" />
      <input type="time" className="border p-2 mb-4 block" />
      <button onClick={handleBooking} className="bg-indigo-600 text-white px-6 py-2 rounded">
        Đặt lịch
      </button>
    </div>
  );
}