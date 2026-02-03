import { Outlet } from "react-router-dom";
import { Suspense } from "react";

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<p>Loading...</p>}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
};

export default AuthLayout;
