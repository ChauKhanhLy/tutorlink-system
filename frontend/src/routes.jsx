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
import { BecomeTutorPage } from "./pages/BecomeTutor";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { TutorDashboard } from "./pages/TutorDashboard";
import { VideoRoomPage } from "./pages/VideoRoom";
import { AdminMessagesPage } from "./pages/admin/AdminMessagesPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { WalletPage } from "./pages/Wallet";
import { QRConfirmPage } from "./pages/QRConfirm";
import { BookingSuccessPage } from "./pages/BookingSuccess";
import { ClassroomPage } from "./pages/Classroom";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <LandingPage /> },

      { path: "search", element: <SearchPage /> },
      {
        path: "tutor/dashboard",
        element: (
          <ProtectedRoute requiredRole="tutor">
            <TutorDashboard />
          </ProtectedRoute>
        ),
      },
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
        path: "tutor/schedule",
        element: (
          <ProtectedRoute requiredRole="tutor">
            <TutorDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "tutor/students",
        element: (
          <ProtectedRoute requiredRole="tutor">
            <TutorDashboard />
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
        path: "wallet",
        element: (
          <ProtectedRoute>
            <WalletPage />
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
        path: "become-tutor",
        element: (
          <ProtectedRoute>
            <BecomeTutorPage />
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
        path: "admin/messages",
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminMessagesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/users",
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminUsersPage />
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
      
      { path: "qr-pay/:transactionId", element: <QRConfirmPage /> },
      
      { path: "booking-success/:id", element: <BookingSuccessPage /> },
      { path: "classroom/:tutorId/:subjectId", element: <ClassroomPage /> },

      { path: "login", element: <AuthPage /> },
      { path: "signup", element: <AuthPage /> },
    ],
  },
]);
