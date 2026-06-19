// src/hooks/useAnalytics.ts
// Drop this file into src/hooks/useAnalytics.ts

import { useEffect } from "react";
import { nanoid } from "nanoid";

const STORAGE_KEY = "vibecoder_analytics";

export interface AnalyticsSession {
  userId: string;
  startTime: number;
  endTime?: number;
  duration?: number; // seconds
}

export interface AnalyticsData {
  sessions: AnalyticsSession[];
  totalVisits: number;
}

function getAnalytics(): AnalyticsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { sessions: [], totalVisits: 0 };
    return JSON.parse(raw) as AnalyticsData;
  } catch {
    return { sessions: [], totalVisits: 0 };
  }
}

function saveAnalytics(data: AnalyticsData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getUserId(): string {
  const key = "vibecoder_user_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = nanoid();
    localStorage.setItem(key, id);
  }
  return id;
}

/**
 * Call this hook once at the app root (e.g. in your __root.tsx outlet wrapper
 * or in your index route component). It starts a session on mount and records
 * the duration on unmount / page unload.
 */
export function useAnalytics() {
  useEffect(() => {
    const userId = getUserId();
    const startTime = Date.now();

    // Record a new visit session
    const data = getAnalytics();
    const session: AnalyticsSession = { userId, startTime };
    data.sessions.push(session);
    data.totalVisits = (data.totalVisits ?? 0) + 1;
    saveAnalytics(data);

    const sessionIndex = data.sessions.length - 1;

    function finalise() {
      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);
      const latest = getAnalytics();
      if (latest.sessions[sessionIndex]) {
        latest.sessions[sessionIndex].endTime = endTime;
        latest.sessions[sessionIndex].duration = duration;
        saveAnalytics(latest);
      }
    }

    // Capture on both unmount and tab close
    window.addEventListener("beforeunload", finalise);
    return () => {
      finalise();
      window.removeEventListener("beforeunload", finalise);
    };
  }, []);
}

// ─── Read-side helpers used by the analytics dashboard ───────────────────────

export function getAnalyticsSummary() {
  const data = getAnalytics();

  const uniqueUsers = new Set(data.sessions.map((s) => s.userId)).size;

  const completedSessions = data.sessions.filter(
    (s) => s.duration !== undefined
  );
  const avgDuration =
    completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce((acc, s) => acc + (s.duration ?? 0), 0) /
            completedSessions.length
        )
      : 0;

  return {
    uniqueUsers,
    avgDuration, // seconds
    totalVisits: data.totalVisits ?? 0,
  };
}
