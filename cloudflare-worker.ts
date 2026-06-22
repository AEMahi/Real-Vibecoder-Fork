// worker.ts (or wrangler.toml config)
// Cloudflare Worker for blanksheet.dev analytics + prompt logging + waitlist.
// Deploy this as your Cloudflare Worker. It:
//   - Tracks unique users, visit counts, session duration (analytics)
//   - Receives and stores prompt-filter logs in KV
//   - Provides an export endpoint for pulling logs to commit to GitHub
//   - Collects waitlist email signups
//
// Requires Cloudflare KV binding named "LOGS" in wrangler.toml:
//   kv_namespaces = [ { binding = "LOGS", id = "..." } ]
//
// Requires EXPORT_SECRET to be set as a Cloudflare secret (NOT a plain var):
//   wrangler secret put EXPORT_SECRET
// Do NOT put this value in wrangler.toml or any committed file.

export interface Env {
  LOGS: KVNamespace;
  EXPORT_SECRET: string;
}

interface AnalyticsData {
  uniqueUsers: Set<string>;
  totalVisits: number;
  avgSessionDuration: number;
  lastUpdated: string;
}

interface PromptLogEntry {
  timestamp: string;
  userId: string;
  prompt: string;
  blocked: boolean;
  reason?: string;
  sanitized?: string;
  hadPIIRedactions?: boolean;
}

// ─── SERVER-SIDE PII REDACTION ────────────────────────────────────────────
const SERVER_PII_PATTERNS = [
  { pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, redaction: "[EMAIL]" },
  { pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g, redaction: "[CREDIT_CARD]" },
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, redaction: "[SSN]" },
  { pattern: /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g, redaction: "[PHONE]" },
  { pattern: /(?:api[_-]?key|token|secret|key)[:\s=]+["']?([A-Za-z0-9_\-\.]{32,})["']?/gi, redaction: "[API_KEY]" },
  { pattern: /\b\d{1,5}\s+(?:[A-Z][a-z]+\s+)+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Way|Court|Ct|Circle|Cir|Park|Parkway|Pkwy)\b/gi, redaction: "[ADDRESS]" },
  { pattern: /(?:my\s+)?(?:email|e-mail|phone|password|pass|ssn|social\s+security|credit\s+card|card\s+number)\s+(?:is|=|:)?\s*["']?([^\s,"'\)]+)["']?/gi, redaction: "[REDACTED]" },
  { pattern: /\b(?:0x[a-fA-F0-9]{40}|1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34})\b/g, redaction: "[CRYPTO_ADDRESS]" },
];

function redactPIIServer(text: string): string {
  let redacted = text;
  for (const { pattern, redaction } of SERVER_PII_PATTERNS) {
    redacted = redacted.replace(pattern, redaction);
    pattern.lastIndex = 0;
  }
  return redacted;
}

async function getUserFingerprint(request: Request): Promise<string> {
  const ua = request.headers.get("user-agent") || "unknown";
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const combined = `${ua}|${ip}`;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(combined));
  const hex = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex.slice(0, 16);
}

function timingSafeEqual(a: string, b: string): boolean {
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);
  const maxLen = Math.max(aBytes.length, bBytes.length, 1);
  const aPadded = new Uint8Array(maxLen);
  const bPadded = new Uint8Array(maxLen);
  aPadded.set(aBytes);
  bPadded.set(bBytes);
  let diff = aBytes.length ^ bBytes.length;
  for (let i = 0; i < maxLen; i++) {
    diff |= aPadded[i] ^ bPadded[i];
  }
  return diff === 0;
}

function isAuthorized(request: Request, env: Env): boolean {
  if (!env.EXPORT_SECRET) return false;
  const authHeader = request.headers.get("Authorization") || "";
  const expected = `Bearer ${env.EXPORT_SECRET}`;
  return timingSafeEqual(authHeader, expected);
}

const INGEST_RATE_LIMIT = {
  MAX_REQUESTS: 30,
  WINDOW_SECONDS: 60,
};

async function checkIngestRateLimit(env: Env, userId: string): Promise<boolean> {
  const key = `ratelimit:${userId}`;
  const current = await env.LOGS.get(key);
  const count = current ? parseInt(current, 10) : 0;
  if (count >= INGEST_RATE_LIMIT.MAX_REQUESTS) return false;
  await env.LOGS.put(key, String(count + 1), {
    expirationTtl: INGEST_RATE_LIMIT.WINDOW_SECONDS,
  });
  return true;
}

const ALLOWED_ORIGINS = [
  "https://blanksheet.pages.dev",
  "https://blanksheet.aarushmahi.workers.dev",
];

function corsHeadersFor(request: Request): Record<string, string> {
  const origin = request.headers.get("Origin") || "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin",
  };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = corsHeadersFor(request);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // ── POST /api/waitlist — save email signup ─────────────────────────────
    if (url.pathname === "/api/waitlist" && request.method === "POST") {
      try {
        const body = await request.json() as { email?: string };
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

        if (!isValidEmail(email)) {
          return new Response(JSON.stringify({ error: "Invalid email address" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Store as a set — key per email so duplicates are naturally deduped
        const waitlistKey = `waitlist:${email}`;
        const existing = await env.LOGS.get(waitlistKey);
        if (!existing) {
          await env.LOGS.put(waitlistKey, JSON.stringify({
            email,
            signedUpAt: new Date().toISOString(),
          }));
        }

        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to save email" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ── GET /api/waitlist/export — export all emails (protected) ──────────
    if (url.pathname === "/api/waitlist/export" && request.method === "GET") {
      if (!isAuthorized(request, env)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      try {
        const list = await env.LOGS.list({ prefix: "waitlist:" });
        const emails = await Promise.all(
          list.keys.map(async (k) => {
            const val = await env.LOGS.get(k.name);
            return val ? JSON.parse(val) : null;
          })
        );
        return new Response(JSON.stringify(emails.filter(Boolean), null, 2), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Export failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ── POST /api/analytics — track visits ────────────────────────────────
    if (url.pathname === "/api/analytics" && request.method === "POST") {
      try {
        const userId = await getUserFingerprint(request);
        const analyticsKey = "analytics:main";

        let analytics: AnalyticsData = {
          uniqueUsers: new Set(),
          totalVisits: 0,
          avgSessionDuration: 0,
          lastUpdated: new Date().toISOString(),
        };

        const stored = await env.LOGS.get(analyticsKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          analytics.uniqueUsers = new Set(parsed.uniqueUsers);
          analytics.totalVisits = parsed.totalVisits || 0;
          analytics.avgSessionDuration = parsed.avgSessionDuration || 0;
        }

        analytics.uniqueUsers.add(userId);
        analytics.totalVisits += 1;
        analytics.lastUpdated = new Date().toISOString();

        await env.LOGS.put(
          analyticsKey,
          JSON.stringify({
            uniqueUsers: Array.from(analytics.uniqueUsers),
            totalVisits: analytics.totalVisits,
            avgSessionDuration: analytics.avgSessionDuration,
            lastUpdated: analytics.lastUpdated,
          }),
          { expirationTtl: 365 * 24 * 60 * 60 }
        );

        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Analytics failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ── POST /api/prompt-log — store prompt-filter results ────────────────
    if (url.pathname === "/api/prompt-log" && request.method === "POST") {
      try {
        const userId = await getUserFingerprint(request);

        const allowed = await checkIngestRateLimit(env, userId);
        if (!allowed) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const body = await request.json() as { prompt?: unknown; blocked?: unknown; reason?: unknown; sanitized?: unknown; hadPIIRedactions?: unknown };
        if (typeof body.prompt !== "string" || typeof body.blocked !== "boolean") {
          return new Response(JSON.stringify({ error: "Invalid payload" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (body.prompt.length > 8000) {
          return new Response(JSON.stringify({ error: "Prompt too long" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const redactedPrompt = redactPIIServer(body.prompt);

        const entry: PromptLogEntry = {
          timestamp: new Date().toISOString(),
          userId,
          prompt: redactedPrompt,
          blocked: body.blocked,
          reason: typeof body.reason === "string" ? body.reason : undefined,
          sanitized: typeof body.sanitized === "string" ? body.sanitized : undefined,
          hadPIIRedactions: Boolean(body.hadPIIRedactions),
        };

        const logsKey = "logs:prompts";
        const current = (await env.LOGS.get(logsKey)) || "";
        const updated = current + JSON.stringify(entry) + "\n";

        await env.LOGS.put(logsKey, updated, {
          expirationTtl: 365 * 24 * 60 * 60,
        });

        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to log entry" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ── GET /api/prompt-log/export ─────────────────────────────────────────
    if (url.pathname === "/api/prompt-log/export" && request.method === "GET") {
      if (!isAuthorized(request, env)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      try {
        const logsKey = "logs:prompts";
        const raw = (await env.LOGS.get(logsKey)) || "";
        const entries = raw
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => JSON.parse(line));

        return new Response(JSON.stringify(entries, null, 2), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Export failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ── GET /api/analytics/export ──────────────────────────────────────────
    if (url.pathname === "/api/analytics/export" && request.method === "GET") {
      if (!isAuthorized(request, env)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      try {
        const analyticsKey = "analytics:main";
        const raw = await env.LOGS.get(analyticsKey);
        const analytics = raw ? JSON.parse(raw) : { uniqueUsers: [], totalVisits: 0 };

        return new Response(JSON.stringify(analytics, null, 2), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Export failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response("Not found", { status: 404, headers: corsHeaders });
  },
};