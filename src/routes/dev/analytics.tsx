// src/routes/dev/analytics.tsx
// TanStack Router auto-discovers this file as the route for /dev/analytics

import { createFileRoute } from "@tanstack/react-router";
import AnalyticsDashboard from "@/pages/AnalyticsDashboard";

export const Route = createFileRoute("/dev/analytics")({
  component: AnalyticsDashboard,
});
