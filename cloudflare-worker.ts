// worker.ts (or wrangler.toml config)
// Cloudflare Worker for blanksheet.dev analytics + prompt logging.
// Deploy this as your Cloudflare Worker. It:
//   - Tracks unique users, visit counts, session duration (analytics)
//   - Receives and stores prompt-filter logs in KV
//   - Provides an export endpoint for pulling logs to commit to GitHub
//
// Requires Cloudflare KV binding named "LOGS" in wrangler.toml:
//   kv_namespaces = [ { binding = "LOGS", id = "..." } ]

export interface Env {
  LOGS: KVNamespace;
}

interface AnalyticsData {
  uniqueUsers: Set<string>;
  totalVisits: number;
  avgSessionDuration: number;
  lastUpdated: string;
}

interface PromptLogEntry {
  timestamp: string;
  userId: string; // fingerprint, not personally identifiable
  prompt: string;
  blocked: boolean;
  reason?: string;
  sanitized?: string;
  hadPIIRedactions?: boolean; // flag from client
}

// ─── SERVER-SIDE PII REDACTION ────────────────────────────────────────────
// Belt-and-suspenders: even if client redaction fails or is bypassed,
// the server does a final scrub before storing.
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

// Simple fingerprinting: hash of user agent + IP, no PII
async function getUserFingerprint(request: Request): Promise<string> {
  const ua = request.headers.get("user-agent") || "unknown";
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const combined = `${ua}|${ip}`;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(combined));
  const hex = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex.slice(0, 16); // short fingerprint
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // POST /api/analytics - track visits
    if (url.pathname === "/api/analytics" && request.method === "POST") {
      try {
        const userId = await getUserFingerprint(request);
        const analyticsKey = "analytics:main";

        // Read current analytics
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

        // Update with this visit
        analytics.uniqueUsers.add(userId);
        analytics.totalVisits += 1;
        analytics.lastUpdated = new Date().toISOString();

        // Store updated analytics
        await env.LOGS.put(
          analyticsKey,
          JSON.stringify({
            uniqueUsers: Array.from(analytics.uniqueUsers),
            totalVisits: analytics.totalVisits,
            avgSessionDuration: analytics.avgSessionDuration,
            lastUpdated: analytics.lastUpdated,
          }),
          { expirationTtl: 365 * 24 * 60 * 60 } // 1 year
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

    // POST /api/prompt-log - store prompt-filter results
    if (url.pathname === "/api/prompt-log" && request.method === "POST") {
      try {
        const body = await request.json();
        if (typeof body.prompt !== "string" || typeof body.blocked !== "boolean") {
          return new Response(JSON.stringify({ error: "Invalid payload" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const userId = await getUserFingerprint(request);
        
        // Server-side PII redaction (defense in depth)
        const redactedPrompt = redactPIIServer(body.prompt);

        const entry: PromptLogEntry = {
          timestamp: new Date().toISOString(),
          userId,
          prompt: redactedPrompt,
          blocked: body.blocked,
          reason: body.reason,
          sanitized: body.sanitized,
          hadPIIRedactions: body.hadPIIRedactions,
        };

        // Append to KV as a newline-delimited JSON stream
        const logsKey = "logs:prompts";
        const current = (await env.LOGS.get(logsKey)) || "";
        const updated = current + JSON.stringify(entry) + "\n";

        await env.LOGS.put(logsKey, updated, {
          expirationTtl: 365 * 24 * 60 * 60, // 1 year
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

    // GET /api/prompt-log/export - fetch all logs as JSON array (for GitHub commit)
    // Requires Authorization header: Bearer <EXPORT_SECRET>
    if (url.pathname === "/api/prompt-log/export" && request.method === "GET") {
      try {
        const authHeader = request.headers.get("Authorization") || "";
        const exportSecret = "your-secret-export-key"; // set via environment variable in wrangler.toml
        if (authHeader !== `Bearer ${exportSecret}`) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

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

    // GET /api/analytics/export - fetch analytics (for your own dashboard)
    if (url.pathname === "/api/analytics/export" && request.method === "GET") {
      try {
        const authHeader = request.headers.get("Authorization") || "";
        const exportSecret = "your-secret-export-key"; // same secret as above
        if (authHeader !== `Bearer ${exportSecret}`) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

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
