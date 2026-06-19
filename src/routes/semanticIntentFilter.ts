// semanticIntentFilter.ts
//
// A lightweight, in-browser content filter that uses keyword matching
// and pattern detection to identify potentially harmful requests.
//
// This implementation uses simple keyword matching with boosting for
// certain phrases, rather than full semantic analysis. It's fast, requires
// no external dependencies, and works entirely in the browser.
//
// HONEST LIMITATIONS:
// - This is keyword/pattern matching, not semantic reasoning. It can be
//   fooled by sufficiently obfuscated requests.
// - It can false-positive on benign prompts that happen to contain flagged words.
// - Treat this as a first-line defense alongside server-side moderation.
// - A determined user can inspect or bypass this entirely on the client.

export interface SemanticResult {
  blocked: boolean;
  reason?: string;
  confidence?: number; // 0–1, estimated confidence score
}

// ─── Malicious keyword patterns ────────────────────────────────────────────
// Keywords and phrases that indicate potentially harmful intent.
// Grouped by category for clarity.

const MALICIOUS_KEYWORDS = {
  ransomware: [
    "ransomware",
    "encrypt files",
    "payment to unlock",
    "lock files",
    "demand payment",
  ],
  malware: [
    "malware",
    "virus",
    "trojan",
    "worm",
    "spyware",
    "keylogger",
    "backdoor",
    "botnet",
  ],
  unauthorized_access: [
    "break into",
    "hack",
    "unauthorized access",
    "steal credentials",
    "password",
    "private key",
    "breach",
    "exploit",
    "vulnerability",
  ],
  system_takeover: [
    "take over",
    "control computer",
    "remote access",
    "disable antivirus",
    "disable firewall",
    "system compromise",
  ],
  surveillance: [
    "record keystrokes",
    "keystroke logger",
    "spy",
    "monitor",
    "track location",
    "screen capture",
  ],
  ddos: ["flood website", "ddos", "denial of service", "crash server"],
  weapons: ["explosive", "bomb", "chemical weapon", "poison", "synthesize"],
  jailbreak: [
    "ignore safety",
    "no restrictions",
    "system instructions",
    "jailbreak",
    "bypass",
    "pretend",
  ],
};

// ─── Benign keyword patterns ───────────────────────────────────────────────
// These help reduce false positives by identifying educational or
// defensive use cases.

const BENIGN_KEYWORDS = [
  "security",
  "defense",
  "protect",
  "antivirus",
  "firewall",
  "certification",
  "learning",
  "education",
  "understand",
  "explain",
  "study",
  "research",
  "patch",
  "vulnerability disclosure",
  "bug bounty",
  "penetration testing",
  "authorized",
  "permission",
];

/**
 * Simple keyword-based classifier. Fast, no external dependencies.
 * Returns a confidence score based on the ratio of malicious to benign matches.
 */
export async function classifyIntent(prompt: string): Promise<SemanticResult> {
  try {
    const lowerPrompt = prompt.toLowerCase();

    // Count malicious keywords
    let maliciousScore = 0;
    let maliciousMatches = 0;

    for (const [category, keywords] of Object.entries(MALICIOUS_KEYWORDS)) {
      for (const keyword of keywords) {
        if (lowerPrompt.includes(keyword)) {
          maliciousScore += 1;
          maliciousMatches++;
          // Boost score for highly specific dangerous phrases
          if (
            keyword === "ransomware" ||
            keyword === "encrypt files" ||
            keyword === "payment to unlock"
          ) {
            maliciousScore += 0.5;
          }
        }
      }
    }

    // Count benign keywords (reduce suspicion)
    let benignScore = 0;
    for (const keyword of BENIGN_KEYWORDS) {
      if (lowerPrompt.includes(keyword)) {
        benignScore += 1;
      }
    }

    // Normalize scores
    const maxScore = Math.max(maliciousScore, 1);
    const confidence = Math.min(maliciousScore / maxScore, 1);

    // Decision logic:
    // - High malicious score + no benign context = block
    // - Benign keywords present significantly reduce blocking
    const netScore = maliciousScore - benignScore * 0.5;
    const shouldBlock = netScore >= 2 && maliciousMatches >= 2;

    return {
      blocked: shouldBlock,
      reason: shouldBlock
        ? "This prompt contains language associated with harmful or illegal activities."
        : undefined,
      confidence,
    };
  } catch (err) {
    // Fail open: if anything goes wrong, don't block
    console.warn("Intent filter error:", err);
    return { blocked: false };
  }
}

/**
 * No-op preload function (kept for API compatibility).
 * The keyword-based filter doesn't need async initialization.
 */
export async function preloadSemanticFilter(): Promise<void> {
  // No-op: keyword filter is synchronous and doesn't need preloading
  return Promise.resolve();
}
