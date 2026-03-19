import { useAppSelector } from "@/redux/hooks";
import type { User } from "@/types/auth";

interface UseAuthReturn {
  user: User | null;
  accessToken: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  isAuthenticated: boolean;
  isInitialized: boolean;
}

// Simple auth hook based on Redux auth slice
export const useAuth = (): UseAuthReturn => {
  const { user, accessToken, status, isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth
  );

  return {
    user,
    accessToken,
    status,
    isAuthenticated,
    isInitialized,
  };
};
