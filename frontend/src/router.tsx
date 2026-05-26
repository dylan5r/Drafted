import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./ui/AppShell";
import { AuthPage } from "./views/AuthPage";
import { DashboardPage } from "./views/DashboardPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "auth",
        element: <AuthPage />,
      },
    ],
  },
]);
