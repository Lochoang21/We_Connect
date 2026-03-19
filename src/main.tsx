import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AlertProvider from "@/context/AlertProvider";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import routes from "@/routes/route";
import { setApiDispatch } from "@/services/apiService";
import { initializeAuth } from "@/redux/slices/authSlice";

const router = createBrowserRouter(routes);

setApiDispatch(store.dispatch);
store.dispatch(initializeAuth());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <AlertProvider>
        <RouterProvider router={router} />
      </AlertProvider>
    </Provider>
  </StrictMode>
);
