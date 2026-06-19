// ARCHITECTURE: Secure Analytics + Prompt Logging + Automated Training

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ User (any device, anywhere)                                     │
│ • Opens blanksheet.dev                                          │
│ • Gets forwarded to localhost:3000 (their own machine)         │
│ • API keys stored ONLY on their machine                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                    (optional opt-in)
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Cloudflare Worker (your infrastructure)                         │
│ • POST /api/analytics ← user visit (anonymous fingerprint)    │
│ • POST /api/prompt-log ← prompt + filter result (if opt-in)   │
│ • GET /api/prompt-log/export ← pull logs for GitHub (auth)   │
│ • Stores everything in Cloudflare KV (global, highly available) │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                  (every 6 hours via GitHub Actions)
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ GitHub Repository                                               │
│ • logs/prompt-filter-log.json (synced from Cloudflare)        │
│ • promptFilter.ts rules                                        │
│ • Analytics history (for your own review)                      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
              (manual run or on schedule)
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Filter Improvement Pipeline                                     │
│ • analyze-and-improve-filter.ts examines logs                  │
│ • Suggests rule updates (false positives/negatives)            │
│ • You review and merge changes to promptFilter.ts              │
└─────────────────────────────────────────────────────────────────┘
```

## Security & Privacy

### What stays on the user's machine:
- ✅ API keys (never sent anywhere except directly to OpenAI/Anthropic/etc)
- ✅ Full prompt text (only sent to the AI model they chose)
- ✅ Code files (never leave their machine)
- ✅ Session data

### What gets sent to Cloudflare (if user opts in):
- ✅ Prompt text (for analysis + training)
- ✅ Whether it was blocked + why
- ✅ Any sanitized version if applicable
- ❌ NOT: API keys, user PII, sensitive system info

### What's stored on your server:
- Aggregated analytics (unique user fingerprints, visit counts)
- Prompt logs (for improving the filter)
- Everything encrypted at rest by Cloudflare

## Files & What They Do

### Frontend (Browser)
- `promptLog.ts` – Sends logs to Cloudflare Worker if user opted in
- `p__projectId__7_.tsx` – Dashboard with "Use Prompts to Improve" button
- `promptFilter.ts` – Rule definitions (unchanged, still runs client-side)

### Backend (Cloudflare Workers)
- `cloudflare-worker.ts` – The actual HTTP endpoint
  - Receives analytics (visit tracking)
  - Receives & stores prompt logs
  - Provides export endpoint for GitHub sync
- `wrangler.toml` – Configuration (KV namespace, secrets)

### GitHub Integration
- `.github/workflows/sync-logs.yml` – Scheduled job to pull logs
- `scripts/sync-prompt-logs.js` – Node script that does the pulling
- `logs/prompt-filter-log.json` – Committed log file (updated by workflow)

### Analysis & Training
- `scripts/analyze-and-improve-filter.ts` – Examines logs, suggests improvements
- Can be run manually or on a schedule
- Outputs `filter-analysis.json` for your review

## Step-by-Step: How a Prompt Gets Logged

1. User types a prompt in the VibeCoder dashboard
2. Prompt goes through `filterPrompt()` on their machine (no backend)
3. Result (blocked or allowed) is passed to `logPromptResult()`
4. If logging is ON, a POST is fired to `https://api.blanksheet.dev/api/prompt-log`
5. Cloudflare Worker receives it, appends to KV store
6. Every 6 hours, GitHub Actions runs `sync-prompt-logs.js`
7. Script fetches all logs from Cloudflare (using auth secret)
8. Writes `logs/prompt-filter-log.json` and commits to GitHub
9. You run `analyze-and-improve-filter.ts` to see what's failing
10. You update rules in `promptFilter.ts` based on the analysis
11. Next deploy includes the improved rules

## Setting Up (Quick Version)

1. **Deploy Cloudflare Worker**
   ```bash
   wrangler login
   wrangler kv:namespace create LOGS
   # Update wrangler.toml with the ID
   wrangler deploy
   ```

2. **Add GitHub Secrets**
   - `CLOUDFLARE_WORKER_URL` = your deployed worker URL
   - `CLOUDFLARE_EXPORT_SECRET` = any random string you generate

3. **Add GitHub Actions**
   - Copy `.github/workflows/sync-logs.yml` to `.github/workflows/sync-logs.yml`

4. **Update Frontend**
   - In `p__projectId__7_.tsx`, import `trackVisit` and call it on mount
   - Set `VITE_PROMPT_LOG_URL` and `VITE_ANALYTICS_URL` in your .env

5. **Optional: Schedule Analysis**
   - Add another GitHub Actions job to run `analyze-and-improve-filter.ts` weekly
   - Review the filter-analysis.json and update rules

## Monitoring & Maintenance

### Check analytics:
```bash
bun run scripts/sync-prompt-logs.js # pulls fresh logs
# Prints: unique users, total visits, blocked vs allowed, etc.
```

### Analyze filter performance:
```bash
bun run scripts/analyze-and-improve-filter.ts
# Shows false positives, false negatives, pattern recommendations
```

### Manually trigger sync (don't wait 6 hours):
- Go to GitHub Actions → sync-logs workflow → Run workflow

## Key Design Decisions

- **Cloudflare Workers**: Global, serverless, low latency from anywhere
- **KV Store**: Simple append-only log storage, no database to manage
- **GitHub as the single source of truth**: Logs are versioned, reviewed, audited
- **Fire-and-forget logging**: Network errors don't break the user experience
- **Opt-in always**: No logging happens unless user clicks the button
- **User fingerprinting, not identification**: Analytics use hashed UA+IP, not cookies/identifiers

## Cost Estimate

- Cloudflare Workers: Free tier covers ~100k requests/day
- KV Storage: Free tier covers 1GB/month (~ 1M small logs)
- GitHub: Private repo + Actions = free for you as the owner
- Total: **Likely free** unless you have massive scale

## Transparency for Users

Your landing page should mention:
- "API keys never leave your computer"
- "Prompts are sent to Cloudflare only if you opt in"
- "We use them to improve the filter (not for any other purpose)"
- "You can opt out anytime"

This builds trust and keeps you honest about data handling.
