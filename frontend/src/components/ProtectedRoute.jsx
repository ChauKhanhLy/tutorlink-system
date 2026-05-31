import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  children,
  requiredRole,
  requiredRoles,
}) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Hỗ trợ nhiều role
  if (
    requiredRoles &&
    !requiredRoles.includes(user.role)
  ) {
    return <Navigate to="/" replace />;
  }

  // Hỗ trợ 1 role cũ
  if (
    requiredRole &&
    user.role !== requiredRole
  ) {
    if (requiredRole === "admin") {
      return (
        <Navigate
          to="/admin/login"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}
/*import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
}*/