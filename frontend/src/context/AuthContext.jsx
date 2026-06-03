import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (storedUser && token) {
        const parsedUser = JSON.parse(storedUser);
        return {
          ...parsedUser,
          verified: parsedUser?.verified ?? false
        };
      }
    } catch (err) {
      console.error("Lỗi khởi tạo user:", err);
    }
    return null;
  });

  // load user từ localStorage khi reload
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);

        setUser({
          ...parsedUser,
          verified: parsedUser?.verified ?? false
        });
      } catch (err) {
        console.error("Lỗi parse user:", err);

        // 🔥 reset luôn nếu lỗi
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
      }
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, []);

  // login
  const login = ({ user, token }) => {
    if (!token) {
      throw new Error("Missing auth token");
    }
    const normalizedUser = {
      ...user,
      verified: user.verified ?? false
    };
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  };

  // logout
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      console.log("ME API DATA:", data);

      const normalizedUser = {
        ...data,
        verified: data?.verified ?? false,
      };

      localStorage.setItem("user", JSON.stringify(normalizedUser));
      setUser(normalizedUser); // 🔥 bắt buộc
    } catch (err) {
      console.error("Refresh user lỗi:", err);
    }
  };

  const updateUser = (newUser) => {
    const normalizedUser = {
      ...newUser,
      verified: newUser?.verified ?? false,
    };

    localStorage.setItem("user", JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, updateUser, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);