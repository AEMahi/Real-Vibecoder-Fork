// promptLog.ts
// Sends prompt-filter results to a backend endpoint, which appends them to
// logs/prompt-filter-log.json on the server. See server/promptLogServer.ts.
//
// Logging is OFF by default. Clicking "Use Prompts to Improve (Recommended)"
// just flips a flag — no file picker, no per-session permission prompts.
// Every prompt after that is silently POSTed to the server in the background.

export interface PromptLogEntry {
  timestamp: string;
  prompt: string;
  blocked: boolean;
  reason?: string;
  sanitized?: string;
}

// Point to your Cloudflare Worker endpoint. Set this via environment variable
// for different deployments (dev vs. prod). Falls back to https://api.blanksheet.dev
// if no env var is set.
const LOG_ENDPOINT =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_PROMPT_LOG_URL) ||
  "https://api.blanksheet.dev/api/prompt-log";

const ANALYTICS_ENDPOINT =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_ANALYTICS_URL) ||
  "https://api.blanksheet.dev/api/analytics";

let loggingEnabled = false;

// ─── PII REDACTION ────────────────────────────────────────────────────────
// Patterns for sensitive information that should be redacted before logging
const PII_PATTERNS = [
  // Email addresses
  { pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, redaction: "[EMAIL]" },
  // Credit card numbers (Visa, Mastercard, Amex, Discover patterns)
  { pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g, redaction: "[CREDIT_CARD]" },
  // SSN (XXX-XX-XXXX)
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, redaction: "[SSN]" },
  // Phone numbers (various formats)
  { pattern: /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g, redaction: "[PHONE]" },
  // API keys (rough pattern: long hex or alphanumeric strings after "key", "token", "api_key", etc.)
  { pattern: /(?:api[_-]?key|token|secret|key)[:\s=]+["']?([A-Za-z0-9_\-\.]{32,})["']?/gi, redaction: "[API_KEY]" },
  // Home/street addresses (rough: numbers followed by street names)
  { pattern: /\b\d{1,5}\s+(?:[A-Z][a-z]+\s+)+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Way|Court|Ct|Circle|Cir|Park|Parkway|Pkwy)\b/gi, redaction: "[ADDRESS]" },
  // Patterns like "my email is...", "my phone...", "password is..."
  { pattern: /(?:my\s+)?(?:email|e-mail|phone|password|pass|ssn|social\s+security|credit\s+card|card\s+number)\s+(?:is|=|:)?\s*["']?([^\s,"'\)]+)["']?/gi, redaction: "[REDACTED]" },
  // Bitcoin/Ethereum addresses
  { pattern: /\b(?:0x[a-fA-F0-9]{40}|1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34})\b/g, redaction: "[CRYPTO_ADDRESS]" },
];

export function redactPII(text: string): { redacted: string; hasRedactions: boolean } {
  let redacted = text;
  let hasRedactions = false;

  for (const { pattern, redaction } of PII_PATTERNS) {
    if (pattern.test(redacted)) {
      hasRedactions = true;
      redacted = redacted.replace(pattern, redaction);
      // Reset global regex lastIndex after replacement
      pattern.lastIndex = 0;
    }
  }

  return { redacted, hasRedactions };
}

export function isLoggingEnabled(): boolean {
  return loggingEnabled;
}

/** Call this from the "Use Prompts to Improve (Recommended)" button. */
export function enableFileLogging(): boolean {
  loggingEnabled = true;
  return true;
}

/** Call this to turn logging back off. */
export function disableFileLogging() {
  loggingEnabled = false;
}

/**
 * Send one entry to the backend log endpoint, if the user has opted in.
 * Automatically redacts PII (email, SSN, credit cards, etc.) before sending.
 * Safe to call unconditionally after every filterPrompt() result — it's a
 * no-op when logging hasn't been enabled. Fire-and-forget: failures are
 * logged to the console but never block or throw in the UI.
 */
export async function logPromptResult(entry: Omit<PromptLogEntry, "timestamp">) {
  if (!loggingEnabled) return;

  // Redact PII from the prompt before sending
  const { redacted, hasRedactions } = redactPII(entry.prompt);
  
  try {
    await fetch(LOG_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: redacted,
        blocked: entry.blocked,
        reason: entry.reason,
        sanitized: entry.sanitized,
        hadPIIRedactions: hasRedactions, // flag for analytics if needed
      }),
    });
  } catch (err) {
    console.warn("Failed to send prompt log entry:", err);
  }
}

/**
 * Track a page visit/session start for analytics.
 * Safe to call once when the app loads — this just increments counters.
 */
export async function trackVisit() {
  try {
    await fetch(ANALYTICS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
  } catch (err) {
    console.warn("Failed to track visit:", err);
  }
}
