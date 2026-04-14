import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { router } from "./routes";
import App from "./App"; // 🔥 thêm dòng này

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App /> {/* chứa Toaster */}
    <RouterProvider router={router} />
  </StrictMode>
);