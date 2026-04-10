import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AlertProvider from "@/context/AlertProvider";
import { FriendsProvider } from "@/components/Friends/FriendsProvider";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import routes from "@/routes/route";
import { setApiDispatch } from "@/services/apiService";
import { initializeAuth } from "@/redux/slices/authSlice";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchNotifications } from "./redux/slices/notificationSlice";

const router = createBrowserRouter(routes);

export const AppShell = () => {

  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isInitialized   = useAppSelector((state) => state.auth.isInitialized)
  
  // Kích hoạt kết nối socket khi app mount
  useNotificationSocket();

   useEffect(() => {
    // ✅ Chỉ fetch sau khi initializeAuth() đã chạy xong
    // và user thực sự đã đăng nhập
    if (isInitialized && isAuthenticated) {
      // 1000 để lấy gần như toàn bộ thông báo từ DB ngay lần đầu
      dispatch(fetchNotifications({ current: 1, pageSize: 1000 }))
    }
  }, [isInitialized, isAuthenticated, dispatch])

  // ✅ Chặn render cho đến khi biết trạng thái auth
  // Tránh flash giao diện hoặc redirect sai
  if (!isInitialized) return null

  return (
    <AlertProvider>
      {isAuthenticated ? (
        <FriendsProvider>
          <RouterProvider router={router} />
        </FriendsProvider>
      ) : (
        <RouterProvider router={router} />
      )}
    </AlertProvider>
  );
};

// Query Client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

setApiDispatch(store.dispatch);
store.dispatch(initializeAuth());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppShell />
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);

