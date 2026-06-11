import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      {/* This Outlet acts like a portal that loads either your index page or your project page automatically depending on the URL */}
      <Outlet />
    </>
  );
}
