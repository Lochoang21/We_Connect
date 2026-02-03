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
  const { user, accessToken, status, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  // We read initial auth state from localStorage synchronously in authSlice,
  // so we can treat it as initialized immediately.
  const isInitialized = true;

  return {
    user,
    accessToken,
    status,
    isAuthenticated,
    isInitialized,
  };
};
