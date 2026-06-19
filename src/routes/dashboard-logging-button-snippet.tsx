// ── Drop-in snippet for Dashboard.tsx ──────────────────────────────────────
// 1. Add this import near your other promptFilter imports:
//
//    import { enableFileLogging, disableFileLogging, isLoggingEnabled, isFileSystemAccessSupported } from "./promptLog";
//
// 2. Add this state near your other useState hooks:
//
//    const [loggingOn, setLoggingOn] = useState(false);
//
// 3. Add this handler near your other handlers:

async function handleToggleImproveLogging(
  loggingOn: boolean,
  setLoggingOn: (v: boolean) => void
) {
  if (loggingOn) {
    disableFileLogging();
    setLoggingOn(false);
    return;
  }
  if (!isFileSystemAccessSupported()) {
    alert(
      "This feature needs a Chromium browser (Chrome or Edge) since it writes directly to a file you choose."
    );
    return;
  }
  const granted = await enableFileLogging();
  setLoggingOn(granted);
}

// 4. Add this button anywhere sensible in your JSX (e.g. near the API key /
//    export buttons). It's a toggle: click once to opt in and pick the log
//    file, click again to turn it off.

/*
<button
  onClick={() => handleToggleImproveLogging(loggingOn, setLoggingOn)}
  className={`px-3 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors ${
    loggingOn
      ? "bg-emerald-600 text-white hover:bg-emerald-700"
      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
  }`}
  title="Saves your prompts to a local file you choose, so you can review them later to improve the filter."
>
  {loggingOn ? "✓ Logging Prompts to Improve" : "Use Prompts to Improve (Recommended)"}
</button>
*/

// Notes:
// - The user picks/creates the file themselves the first time (e.g.
//   "prompt-filter-log.json"). After that, every prompt is appended
//   automatically with no further clicks, until they toggle it off or
//   reload the page (browsers require re-granting file permission per
//   session — this can't be bypassed from JS).
// - Be transparent in your UI copy that this saves prompt content to a file
//   on their machine — don't bury that. The label above says so plainly.
// - Firefox/Safari don't support the File System Access API yet; the
//   isFileSystemAccessSupported() check + alert handles that gracefully.
