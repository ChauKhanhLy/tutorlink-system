import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:3000/api",
  /*headers: {
    "Content-Type": "application/json",
  },*/
});

// REQUEST INTERCEPTOR
axiosClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.log("Parse user error:", err);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// RESPONSE INTERCEPTOR
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("API ERROR:", error.response); // 👈 debug cực quan trọng

    if (error.response?.status === 401 || (error.response?.status === 403 && error.response?.data?.message?.toLowerCase().includes("token"))) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
