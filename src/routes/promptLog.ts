// promptLog.ts
// Automatic on-disk logging for prompt-filter review, using the browser's
// File System Access API (Chrome/Edge only — falls back gracefully elsewhere).
//
// Logging is OFF by default. The user must explicitly click the
// "Use Prompts to Improve (Recommended)" button, which:
//   1. Prompts them to pick or create a log file (e.g. prompt-filter-log.json)
//   2. Grants this page permission to write to that file
//   3. From then on, every prompt automatically appends to it — no further clicks
//
// Permission is per-session: browsers don't allow silent persistence of file
// access across reloads, so the user will need to re-grant after a refresh.
// That's a browser security boundary, not something we can code around.

export interface PromptLogEntry {
  timestamp: string;
  prompt: string;
  blocked: boolean;
  reason?: string;
  sanitized?: string;
}

let fileHandle: FileSystemFileHandle | null = null;
let loggingEnabled = false;

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== "undefined" && "showSaveFilePicker" in window;
}

export function isLoggingEnabled(): boolean {
  return loggingEnabled;
}

/**
 * Call this from the "Use Prompts to Improve (Recommended)" button's onClick.
 * Asks the user to pick/create the log file, then turns on automatic logging.
 * Returns true if the user granted access and logging is now active.
 */
export async function enableFileLogging(): Promise<boolean> {
  if (!isFileSystemAccessSupported()) {
    console.warn("File System Access API not supported in this browser.");
    return false;
  }
  try {
    // @ts-ignore — showSaveFilePicker isn't in all TS lib defs yet
    fileHandle = await window.showSaveFilePicker({
      suggestedName: "prompt-filter-log.json",
      types: [{ description: "JSON Log", accept: { "application/json": [".json"] } }],
    });

    // If the file is new/empty, seed it with an empty array so appends are valid JSON.
    const existing = await readExistingEntries();
    if (existing === null) {
      await writeEntries([]);
    }

    loggingEnabled = true;
    return true;
  } catch (err) {
    // User cancelled the picker, or permission denied
    loggingEnabled = false;
    fileHandle = null;
    return false;
  }
}

/** Turn off automatic logging (does not delete the file or its contents). */
export function disableFileLogging() {
  loggingEnabled = false;
  fileHandle = null;
}

async function readExistingEntries(): Promise<PromptLogEntry[] | null> {
  if (!fileHandle) return null;
  try {
    const file = await fileHandle.getFile();
    const text = await file.text();
    if (!text.trim()) return null; // empty file, treat as "needs seeding"
    return JSON.parse(text) as PromptLogEntry[];
  } catch {
    return null;
  }
}

async function writeEntries(entries: PromptLogEntry[]) {
  if (!fileHandle) return;
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(entries, null, 2));
  await writable.close();
}

/**
 * Append one entry to the on-disk log file, if the user has opted in.
 * Safe to call unconditionally after every filterPrompt() result — it's a
 * no-op when logging hasn't been enabled.
 */
export async function logPromptResult(entry: Omit<PromptLogEntry, "timestamp">) {
  if (!loggingEnabled || !fileHandle) return;
  const fullEntry: PromptLogEntry = { ...entry, timestamp: new Date().toISOString() };
  try {
    const existing = (await readExistingEntries()) ?? [];
    existing.push(fullEntry);
    await writeEntries(existing);
  } catch (err) {
    console.warn("Failed to write prompt log entry:", err);
  }
}
