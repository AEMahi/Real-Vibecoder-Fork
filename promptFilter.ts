// promptFilter.ts
// Drop this file into your project alongside Dashboard.tsx.
// Import and call `filterPrompt(input)` before sendToAI() in handleFormSubmit.

export interface FilterResult {
  blocked: boolean;
  reason?: string;
  sanitized?: string; // cleaned version of the prompt if minor issues found
}

// ─── 1. HARD-BLOCKED CATEGORIES ───────────────────────────────────────────────
// These patterns cause an immediate block with no sanitization fallback.

const HARD_BLOCK_PATTERNS: { pattern: RegExp; reason: string }[] = [
  // Prompt injection / jailbreak attempts
  {
    pattern: /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?|context)/i,
    reason: "Prompt injection attempt detected.",
  },
  {
    pattern: /you\s+are\s+now\s+(a\s+)?(different|new|evil|unrestricted|unfiltered|jailbroken|dan)/i,
    reason: "Role-override jailbreak attempt detected.",
  },
  {
    pattern: /pretend\s+(you\s+)?(have\s+no\s+(rules?|restrictions?|guidelines?)|are\s+an?\s+(evil|unrestricted|unfiltered))/i,
    reason: "Restriction-bypass attempt detected.",
  },
  {
    pattern: /\[?(DAN|DUDE|STAN|JAILBREAK|AIM|ANTI-DAN)\]?/i,
    reason: "Known jailbreak persona token detected.",
  },
  {
    pattern: /(do\s+anything\s+now|developer\s+mode\s+enabled|enable\s+developer\s+mode)/i,
    reason: "Known jailbreak phrase detected.",
  },
  {
    pattern: /act\s+as\s+(if\s+you\s+(have\s+no|are\s+without)\s+(rules?|restrictions?|limits?|ethics?))/i,
    reason: "Ethics-bypass instruction detected.",
  },

  // Malware / exploit generation
  {
    pattern: /(write|create|generate|make|build|code)\s+(me\s+)?(a\s+)?(virus|malware|ransomware|trojan|keylogger|rootkit|botnet|worm|spyware|backdoor)/i,
    reason: "Malware generation request blocked.",
  },
  {
    pattern: /(sql\s*injection|xss\s*payload|cross.site\s*scripting\s*attack|command\s*injection\s*exploit)/i,
    reason: "Exploit payload generation request blocked.",
  },
  {
    pattern: /(reverse\s*shell|bind\s*shell|meterpreter|metasploit\s*payload)/i,
    reason: "Offensive security exploit request blocked.",
  },

  // Weapons / dangerous substances
  {
    pattern: /(how\s+to\s+(make|build|create|synthesize|produce)\s+.{0,30}(bomb|explosive|weapon|poison|nerve\s*agent|bioweapon))/i,
    reason: "Dangerous materials request blocked.",
  },

  // PII harvesting instructions
  {
    pattern: /(extract|scrape|harvest|steal|exfiltrate)\s+(user\s+)?(personal\s+)?(data|passwords?|credentials?|emails?|credit\s*cards?)/i,
    reason: "Data exfiltration instruction blocked.",
  },

  // System prompt leaking
  {
    pattern: /(repeat|reveal|print|output|show|display|tell\s+me)\s+(your\s+)?(system\s+prompt|initial\s+instructions?|original\s+prompt|secret\s+instructions?)/i,
    reason: "System prompt extraction attempt blocked.",
  },
];

// ─── 2. SOFT-BLOCK / SANITIZE PATTERNS ────────────────────────────────────────
// These strip out suspicious fragments but still allow the prompt through
// (useful for prompts that trigger on incidental word matches).

const SANITIZE_PATTERNS: RegExp[] = [
  /(\bassistant:\s*)/gi,       // fake assistant turns
  /(\bsystem:\s*)/gi,          // fake system turns
  /(\bhuman:\s*)/gi,           // fake human turns
  /<\|?(im_start|im_end|endoftext)\|?>/gi, // special tokens
  /(\[INST\]|\[\/INST\])/gi,   // Llama instruction tags
];

// ─── 3. RATE LIMITER ──────────────────────────────────────────────────────────
// Blocks more than MAX_REQUESTS prompts within WINDOW_MS milliseconds
// to prevent automated abuse / prompt-flooding.

const RATE_LIMIT = {
  MAX_REQUESTS: 10,
  WINDOW_MS: 60_000, // 1 minute
};

const requestLog: number[] = [];

function checkRateLimit(): boolean {
  const now = Date.now();
  // Evict timestamps outside the window
  while (requestLog.length > 0 && requestLog[0] < now - RATE_LIMIT.WINDOW_MS) {
    requestLog.shift();
  }
  if (requestLog.length >= RATE_LIMIT.MAX_REQUESTS) {
    return false; // rate limit exceeded
  }
  requestLog.push(now);
  return true;
}

// ─── 4. BASIC LENGTH / CONTENT SANITY CHECKS ─────────────────────────────────

const MAX_PROMPT_LENGTH = 8_000; // characters
const MIN_PROMPT_LENGTH = 1;

function sanityCheck(prompt: string): FilterResult | null {
  const trimmed = prompt.trim();

  if (trimmed.length < MIN_PROMPT_LENGTH) {
    return { blocked: true, reason: "Prompt is empty." };
  }
  if (trimmed.length > MAX_PROMPT_LENGTH) {
    return {
      blocked: true,
      reason: `Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH} characters.`,
    };
  }
  // Reject prompts that are >90% non-ASCII (obfuscation / encoding attacks)
  const nonAsciiRatio =
    (trimmed.match(/[^\x00-\x7F]/g) || []).length / trimmed.length;
  if (nonAsciiRatio > 0.9 && trimmed.length > 20) {
    return { blocked: true, reason: "Prompt contains excessive non-ASCII content." };
  }
  return null;
}

// ─── 5. MAIN EXPORT ───────────────────────────────────────────────────────────

export function filterPrompt(rawPrompt: string): FilterResult {
  // 5a. Sanity check
  const sanityResult = sanityCheck(rawPrompt);
  if (sanityResult) return sanityResult;

  // 5b. Rate limit
  if (!checkRateLimit()) {
    return {
      blocked: true,
      reason: "Too many requests. Please wait a moment before sending another prompt.",
    };
  }

  // 5c. Hard block
  for (const { pattern, reason } of HARD_BLOCK_PATTERNS) {
    if (pattern.test(rawPrompt)) {
      return { blocked: true, reason };
    }
  }

  // 5d. Sanitize (soft clean — strip injected turn markers / special tokens)
  let sanitized = rawPrompt;
  for (const pattern of SANITIZE_PATTERNS) {
    sanitized = sanitized.replace(pattern, "");
  }
  sanitized = sanitized.trim();

  // If sanitization meaningfully changed the prompt, note it but still allow
  const wasSanitized = sanitized !== rawPrompt.trim();
  return {
    blocked: false,
    sanitized: wasSanitized ? sanitized : undefined,
  };
}
