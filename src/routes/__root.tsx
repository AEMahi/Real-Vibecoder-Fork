import { createRootRoute, Outlet } from "@tanstack/react-router";
import "../styles.css";
import { useAnalytics } from "@/hooks/useAnalytics";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  useAnalytics();
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Outlet />
    </div>
  );
}