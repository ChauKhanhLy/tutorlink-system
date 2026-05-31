import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";
import { MessagesPage } from "../Messages";

export function AdminMessagesPage() {
  const { user } = useAuth();
   if (
    !["admin", "support_staff"].includes(
      user?.role
    )
  ) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }


  // Truyền prop adminMode để MessagesPage biết gọi API admin
  return <MessagesPage adminMode />;
}