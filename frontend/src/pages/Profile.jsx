import React from "react";

export function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Hồ sơ</h1>
      <img src={user?.avatar} className="w-20 h-20 rounded-full mb-4" />
      <p>Tên: {user?.name}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
}