import React from "react";
import { useParams } from "react-router-dom";

export function Lesson() {
  const { bookingId } = useParams();

  return (
    <div className="max-w-4xl mx-auto mt-20 p-6">
      <h1 className="text-2xl font-bold mb-6">Buổi học #{bookingId}</h1>

      <div className="h-[400px] bg-black rounded-2xl flex items-center justify-center text-white">
        Video Call (Zoom / WebRTC sau)
      </div>
    </div>
  );
}
