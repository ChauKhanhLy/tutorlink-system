import { createBrowserRouter } from "react-router-dom";
import { LandingPage } from "./pages/Home";
import { SearchPage } from "./pages/Search";
import { TutorProfilePage } from "./pages/TutorProfile";
import { DashboardPage } from "./pages/Dashboard";
import { MessagesPage } from "./pages/Messages";
import { AuthPage } from "./pages/Auth";
import { Layout } from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { BookingPage } from "./pages/Booking";
import { LessonPage } from "./pages/Lesson";
import { PaymentPage } from "./pages/Payment";
import { ProfilePage } from "./pages/Profile";
import { ReviewPage } from "./pages/Review";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { VideoRoomPage } from "./pages/VideoRoom";

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
      {
        path: "bookings",
        element: (
          <ProtectedRoute>
            <BookingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "lesson/:id",
        element: (
          <ProtectedRoute>
            <LessonPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "payments",
        element: (
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "review",
        element: (
          <ProtectedRoute>
            <ReviewPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/login",
        element: <AdminLogin />,
      },
      {
        path: "admin/dashboard",
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "room/:id",
        element: (
          <ProtectedRoute>
            <VideoRoomPage />
          </ProtectedRoute>
        ),
      },

      { path: "login", element: <AuthPage /> },
      { path: "signup", element: <AuthPage /> },
    ],
  },
]);
