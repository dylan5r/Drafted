import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./ui/AppShell";
import { AuthPage } from "./views/AuthPage";
import { DashboardPage } from "./views/DashboardPage";

// The 2K27 builder carries ~220 kB of rules tables. Nothing else in the app
// needs them, so it loads on its own route rather than in the main bundle.
const BuilderPage = lazy(() =>
  import("./views/BuilderPage").then((module) => ({ default: module.BuilderPage })),
);

function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-sm text-white/40">
      Loading rules data...
    </div>
  );
}

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
      {
        path: "2k27",
        element: (
          <Suspense fallback={<Loading />}>
            <BuilderPage />
          </Suspense>
        ),
      },
    ],
  },
]);
