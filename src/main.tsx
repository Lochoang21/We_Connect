import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AlertProvider from "@/context/AlertProvider";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import routes from "@/routes/route";
import AppInitializer from "@/components/AppInitializer";

const router = createBrowserRouter(routes);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <AppInitializer>
        <AlertProvider>
          <RouterProvider router={router} />
        </AlertProvider>
      </AppInitializer>
    </Provider>
  </StrictMode>
);
