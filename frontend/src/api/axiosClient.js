// import axios from "axios";

// const axiosClient = axios.create({
//   baseURL: "http://localhost:3000/api",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // REQUEST INTERCEPTOR
// axiosClient.interceptors.request.use(
//   (config) => {
//     try {
//       const token = localStorage.getItem("token");

//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//     } catch (err) {
//       console.log("Parse user error:", err);
//     }

//     return config;
//   },
//   (error) => Promise.reject(error),
// );

// // RESPONSE INTERCEPTOR
// axiosClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.log("API ERROR:", error.response); // 👈 debug cực quan trọng

//     if (error.response?.status === 401 || (error.response?.status === 403 && error.response?.data?.message?.toLowerCase().includes("token"))) {
//       localStorage.removeItem("user");
//       localStorage.removeItem("token");
//       window.location.href = "/login";
//     }

//     return Promise.reject(error);
//   },
// );

// export default axiosClient;

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log("API_BASE_URL =", API_BASE_URL);
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
});

// REQUEST INTERCEPTOR
axiosClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Nếu data là FormData thì để browser tự set Content-Type multipart/form-data
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      } else {
        config.headers["Content-Type"] = "application/json";
      }
    } catch (err) {
      console.log("Parse user error:", err);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("API ERROR:", error.response);

    if (
      error.response?.status === 401 ||
      (error.response?.status === 403 &&
        error.response?.data?.message?.toLowerCase().includes("token"))
    ) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosClient;