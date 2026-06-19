// src/pages/AnalyticsDashboard.tsx
// Place this file at src/pages/AnalyticsDashboard.tsx

import { useEffect, useState } from "react";
import { getAnalyticsSummary } from "@/hooks/useAnalytics";

// ─── Dev password gate ────────────────────────────────────────────────────────
// Change this value to any secret your team shares.
// For a real production app you would verify a token against a backend;
// this client-side check is a lightweight "keep casuals out" measure.
const DEV_PASSWORD = "vibecoder-devs-only";

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-7 flex flex-col gap-1 backdrop-blur-sm">
      <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
        {label}
      </span>
      <span className="text-5xl font-bold text-white tabular-nums leading-tight">
        {value}
      </span>
      {sub && <span className="text-sm text-neutral-500">{sub}</span>}
    </div>
  );
}

// ─── Login gate ───────────────────────────────────────────────────────────────
function LoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  function attempt() {
    if (input === DEV_PASSWORD) {
      sessionStorage.setItem("dev_auth", "1");
      onSuccess();
    } else {
      setError(true);
      setInput("");
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d10] flex items-center justify-center">
      <div className="w-full max-w-sm space-y-6 px-6">
        {/* Logo mark */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 mb-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-violet-400"
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-white">Dev Analytics</h1>
          <p className="text-sm text-neutral-500">
            This page is restricted to the development team.
          </p>
        </div>

        <div className="space-y-3">
          <input
            type="password"
            placeholder="Enter dev password"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && attempt()}
            className={`w-full rounded-lg border px-4 py-3 bg-white/5 text-white placeholder-neutral-600 text-sm outline-none transition focus:ring-2 focus:ring-violet-500 ${
              error
                ? "border-red-500/60 focus:ring-red-500"
                : "border-white/10"
            }`}
          />
          {error && (
            <p className="text-xs text-red-400">
              Incorrect password. Try again.
            </p>
          )}
          <button
            onClick={attempt}
            className="w-full rounded-lg bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white text-sm font-medium py-3 transition"
          >
            Access dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard() {
  const summary = getAnalyticsSummary();

  return (
    <div className="min-h-screen bg-[#0d0d10] text-white">
      {/* Header */}
      <header className="border-b border-white/[0.06] px-8 py-5 flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-violet-400"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </div>
        <span className="font-semibold tracking-tight">Real Vibecoder</span>
        <span className="ml-1 text-xs font-mono text-neutral-500 border border-white/10 rounded px-2 py-0.5">
          dev analytics
        </span>
      </header>

      {/* Body */}
      <main className="max-w-4xl mx-auto px-8 py-14 space-y-10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Site Analytics
          </h2>
          <p className="text-neutral-500 text-sm mt-1">
            Collected from visitors' browsers via localStorage — no backend
            required.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Unique Users"
            value={summary.uniqueUsers.toLocaleString()}
            sub="distinct browser fingerprints"
          />
          <StatCard
            label="Avg. Session"
            value={formatDuration(summary.avgDuration)}
            sub="across completed sessions"
          />
          <StatCard
            label="Total Visits"
            value={summary.totalVisits.toLocaleString()}
            sub="all page loads recorded"
          />
        </div>

        {/* Note */}
        <p className="text-xs text-neutral-600 leading-relaxed border-t border-white/[0.06] pt-6">
          Data is stored in <code className="text-neutral-400">localStorage</code>{" "}
          on each visitor's device and aggregated here client-side. It persists
          across sessions on the same browser but does not sync across devices.
          Clear localStorage to reset. For production-grade analytics consider
          a server-side solution.
        </p>
      </main>
    </div>
  );
}

// ─── Route component (default export) ────────────────────────────────────────
export default function AnalyticsDashboard() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem("dev_auth") === "1"
  );

  useEffect(() => {
    // Refresh auth state in case it changed in another tab
    setAuthed(sessionStorage.getItem("dev_auth") === "1");
  }, []);

  if (!authed) {
    return <LoginGate onSuccess={() => setAuthed(true)} />;
  }

  return <Dashboard />;
}
