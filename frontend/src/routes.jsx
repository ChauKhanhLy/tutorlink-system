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

      { path: "login", element: <AuthPage /> },
      { path: "signup", element: <AuthPage /> },
    ],
  },
]);