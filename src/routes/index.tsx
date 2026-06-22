import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: ComingSoon,
});

export default function ComingSoon() {
  useEffect(() => {
    window.location.href = "/coming-soon.html";
  }, []);

  return null;
}