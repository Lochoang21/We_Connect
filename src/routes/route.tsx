import { lazy } from "react";
import AuthLayout from "@/pages/Auth/AuthLayout";
import RegisterPage from "@/pages/Auth/RegisterPage";
import LoginPage from "@/pages/Auth/LoginPage";
import { PublicRoute } from "@/components/PublicRoute";
import { PrivateRoute } from "@/components/PrivateRoute";
import { FriendListPage } from "@/components/Friends/FriendListPage";

const HomeLayout = lazy(() => import("@/pages/HomeLayout"));
const HomePage = lazy(() => import("@/pages/HomePage"));
const ProfilePage = lazy(() => import("@/pages/Profile/ProfilePage"));

const routes = [
  {
    element: (
      <PrivateRoute>
        <HomeLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
      {
        path: "/friends",
        element: <FriendListPage />,
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/register",
        element: (
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        ),
      },
      {
        path: "/login",
        element: (
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        ),
      },
    ],
  },
];

export default routes;
