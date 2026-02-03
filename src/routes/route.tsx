import { lazy } from "react";
import AuthLayout from "@/pages/Auth/AuthLayout";
import RegisterPage from "@/pages/Auth/RegisterPage";
import LoginPage from "@/pages/Auth/LoginPage";
import { PublicRoute } from "@/components/PublicRoute";
import { PrivateRoute } from "@/components/PrivateRoute";

const HomePage = lazy(() => import("@/pages/HomePage"));

const routes = [
  {
    path: "/",
    element: (
      <PrivateRoute>
        <HomePage />
      </PrivateRoute>
    ),
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
