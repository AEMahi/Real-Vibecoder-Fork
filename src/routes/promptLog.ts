// promptLog.ts
// Lightweight client-side logging for prompt-filter review.
// Browsers can't write directly to files on disk/repo, so this stores
// entries in localStorage and lets you export them as a JSON file you can
// commit to the repo (e.g. logs/prompt-filter-log.json) for manual review.

export interface PromptLogEntry {
  timestamp: string;       // ISO string
  prompt: string;          // original raw prompt (consider truncating/redacting if sensitive)
  blocked: boolean;
  reason?: string;
  sanitized?: string;
}

const LOG_STORAGE_KEY = "promptFilterLog";
const MAX_LOG_ENTRIES = 1000; // cap so localStorage doesn't grow unbounded

function readLog(): PromptLogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLog(entries: PromptLogEntry[]) {
  try {
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage full or unavailable — fail silently, logging is best-effort
  }
}

/**
 * Record a prompt-filter result for later review.
 * Call this right after filterPrompt() / filterPromptWithContext() resolves.
 */
export function logPromptResult(entry: Omit<PromptLogEntry, "timestamp">) {
  const entries = readLog();
  entries.push({ ...entry, timestamp: new Date().toISOString() });
  // Keep only the most recent MAX_LOG_ENTRIES
  while (entries.length > MAX_LOG_ENTRIES) {
    entries.shift();
  }
  writeLog(entries);
}

/** Return all logged entries (e.g. to render a review table in an admin view). */
export function getPromptLog(): PromptLogEntry[] {
  return readLog();
}

/** Clear the local log after you've exported/reviewed it. */
export function clearPromptLog() {
  writeLog([]);
}

/**
 * Download the current log as a JSON file. Wire this to a button —
 * e.g. an "Export Filter Log" button near the API key panel — then commit
 * the downloaded file into the repo (e.g. logs/prompt-filter-log.json).
 */
export function exportPromptLog() {
  const entries = readLog();
  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `prompt-filter-log-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
