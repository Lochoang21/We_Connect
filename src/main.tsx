import { StrictMode } from "react";
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
import { useAppSelector } from "@/redux/hooks";

const router = createBrowserRouter(routes);

export const AppShell = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

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
