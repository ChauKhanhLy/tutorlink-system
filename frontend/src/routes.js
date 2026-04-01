import { createBrowserRouter } from "react-router-dom";
import { LandingPage } from "./pages/Home";
import { SearchPage } from "./pages/Search";
import { TutorProfilePage } from "./pages/TutorProfile";
import { DashboardPage } from "./pages/Dashboard";
import { MessagesPage } from "./pages/Messages";
import { AuthPage } from "./pages/Auth";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: LandingPage },
      { path: "search", Component: SearchPage },
      { path: "tutor/:id", Component: TutorProfilePage },
      { path: "dashboard", Component: DashboardPage },
      { path: "messages", Component: MessagesPage },
      { path: "login", Component: AuthPage },
      { path: "signup", Component: AuthPage },
    ],
  },
]);