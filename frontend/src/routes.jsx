import { createBrowserRouter } from "react-router-dom";
import { LandingPage } from "./pages/Home";
import { SearchPage } from "./pages/Search";
import { TutorProfilePage } from "./pages/TutorProfile";
import { DashboardPage } from "./pages/Dashboard";
import { MessagesPage } from "./pages/Messages";
import { AuthPage } from "./pages/Auth";
import { Layout } from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "search", element: <SearchPage /> },
      { path: "tutor/:id", element: <TutorProfilePage /> },

      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "messages",
        element: (
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        ),
      },

      { path: "login", element: <AuthPage /> },
      { path: "signup", element: <AuthPage /> },
    ],
  },
]);