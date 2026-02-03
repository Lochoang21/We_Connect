// src/components/PublicRoute.tsx

import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, isInitialized } = useAuth();

  // Show loading while checking auth
  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to home if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
