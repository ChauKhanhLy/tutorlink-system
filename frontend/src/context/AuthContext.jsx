import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // load user từ localStorage khi reload
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    } else if (storedUser || token) {
      // Tránh trạng thái auth nửa vời gây bị đá ra ngay.
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, []);

  // login
  const login = (data) => {
    const { token, ...userData } = data || {};

    if (!token) {
      throw new Error("Missing auth token");
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // logout
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);