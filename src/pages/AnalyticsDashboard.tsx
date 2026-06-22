// src/pages/AnalyticsDashboard.tsx

import { useEffect, useState } from "react";

const DEV_PASSWORD = "vibecoder-devs-only";
const WORKER_URL = "https://blanksheet-worker.aarushmahi.workers.dev";

interface ServerAnalytics {
  uniqueUsers: string[];
  totalVisits: number;
  avgSessionDuration: number;
  lastUpdated: string;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

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
function LoginGate({ onSuccess }: { onSuccess: (secret: string) => void }) {
  const [password, setPassword] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState(false);

  function attempt() {
    if (password === DEV_PASSWORD) {
      sessionStorage.setItem("dev_auth", "1");
      sessionStorage.setItem("dev_secret", secret);
      onSuccess(secret);
    } else {
      setError(true);
      setPassword("");
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d10] flex items-center justify-center">
      <div className="w-full max-w-sm space-y-6 px-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 mb-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-white">Dev Analytics</h1>
          <p className="text-sm text-neutral-500">Restricted to the development team.</p>
        </div>

        <div className="space-y-3">
          <input
            type="password"
            placeholder="Dev password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            onKeyDown={(e) => e.key === "Enter" && attempt()}
            className={`w-full rounded-lg border px-4 py-3 bg-white/5 text-white placeholder-neutral-600 text-sm outline-none transition focus:ring-2 focus:ring-violet-500 ${error ? "border-red-500/60" : "border-white/10"}`}
          />
          <input
            type="password"
            placeholder="Export secret (from wrangler)"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && attempt()}
            className="w-full rounded-lg border border-white/10 px-4 py-3 bg-white/5 text-white placeholder-neutral-600 text-sm outline-none transition focus:ring-2 focus:ring-violet-500"
          />
          {error && <p className="text-xs text-red-400">Incorrect password. Try again.</p>}
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
function Dashboard({ exportSecret }: { exportSecret: string }) {
  const [data, setData] = useState<ServerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchAnalytics() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${WORKER_URL}/api/analytics/export`, {
        headers: { Authorization: `Bearer ${exportSecret}` },
      });
      if (!res.ok) {
        setError(`Failed to fetch analytics (${res.status})`);
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError("Could not reach analytics worker. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0d10] text-white">
      <header className="border-b border-white/[0.06] px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <span className="font-semibold tracking-tight">BlankSheet</span>
          <span className="ml-1 text-xs font-mono text-neutral-500 border border-white/10 rounded px-2 py-0.5">
            dev analytics
          </span>
        </div>
        <button
          onClick={fetchAnalytics}
          className="text-xs text-neutral-400 hover:text-white border border-white/10 rounded px-3 py-1.5 transition"
        >
          Refresh
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-14 space-y-10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Site Analytics</h2>
          <p className="text-neutral-500 text-sm mt-1">
            Live data from Cloudflare KV — aggregated across all users and devices.
          </p>
        </div>

        {loading && (
          <div className="text-neutral-500 text-sm animate-pulse">Loading analytics...</div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-6 py-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {data && !loading && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                label="Unique Users"
                value={data.uniqueUsers.length.toLocaleString()}
                sub="distinct browser fingerprints"
              />
              <StatCard
                label="Avg. Session"
                value={formatDuration(data.avgSessionDuration ?? 0)}
                sub="across completed sessions"
              />
              <StatCard
                label="Total Visits"
                value={data.totalVisits.toLocaleString()}
                sub="all page loads recorded"
              />
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed border-t border-white/[0.06] pt-6">
              Last updated: {new Date(data.lastUpdated).toLocaleString()}. Data is stored in Cloudflare KV and aggregated server-side across all visitors.
            </p>
          </>
        )}
      </main>
    </div>
  );
}

// ─── Route component ──────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem("dev_auth") === "1"
  );
  const [exportSecret, setExportSecret] = useState(
    () => sessionStorage.getItem("dev_secret") ?? ""
  );

  if (!authed) {
    return (
      <LoginGate
        onSuccess={(secret) => {
          setExportSecret(secret);
          setAuthed(true);
        }}
      />
    );
  }

  return <Dashboard exportSecret={exportSecret} />;
}