import { Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div className="min-h-screen bg-base text-white">
      <div className="fixed inset-0 -z-20 bg-haze" />
      <div className="fixed inset-0 -z-10 bg-grid bg-[size:90px_90px] opacity-20" />
      <Outlet />
    </div>
  );
}
