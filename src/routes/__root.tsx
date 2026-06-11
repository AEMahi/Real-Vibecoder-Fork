import { createRootRoute, Outlet } from "@tanstack/react-router";
import "../styles.css"; // <-- This perfectly matches your src/styles.css file!

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Outlet />
    </div>
  );
}
