// src/components/AppInitializer.tsx
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchUserProfile } from "@/redux/slices/authSlice";
import { tokenStorage } from "@/utils/tokenStorage";
import { migrateOldTokens } from "@/utils/migrateOldTokens";

interface AppInitializerProps {
  children: React.ReactNode;
}

/**
 * AppInitializer - Khởi tạo ứng dụng và validate token
 * - Migrate old tokens (if any)
 * - Kiểm tra token trong localStorage
 * - Fetch user profile nếu có token
 * - Clear token nếu không hợp lệ
 */
export const AppInitializer = ({ children }: AppInitializerProps) => {
  const dispatch = useAppDispatch();
  const { user, accessToken, status } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Step 1: Migrate old tokens to new format (run once)
    migrateOldTokens();

    // Step 2: Nếu có token nhưng chưa có user info, fetch profile
    if (accessToken && !user && status === 'idle') {
      dispatch(fetchUserProfile());
    }

    // Step 3: Nếu không có token, clear localStorage để tránh token cũ/lỗi
    if (!accessToken) {
      tokenStorage.clearTokens();
    }
  }, [accessToken, user, status, dispatch]);

  // Show loading khi đang fetch profile lần đầu
  if (accessToken && !user && status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AppInitializer;
