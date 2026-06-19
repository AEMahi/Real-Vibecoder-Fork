// SETUP GUIDE: Cloudflare Workers + Prompt Logging + GitHub Integration

## 1. Deploy Cloudflare Worker

```bash
# Install wrangler (Cloudflare's CLI)
npm install -g wrangler

# Login to your Cloudflare account
wrangler login

# Create a KV namespace for this project
wrangler kv:namespace create "LOGS"
wrangler kv:namespace create "LOGS" --preview

# Update wrangler.toml with the IDs that were printed above:
# kv_namespaces = [
#   { binding = "LOGS", id = "your-actual-id", preview_id = "your-preview-id" }
# ]

# Generate a secure export secret (store in Cloudflare + GitHub Secrets)
openssl rand -hex 32

# Deploy
wrangler deploy

# Your worker is now live at: https://blanksheet-worker.<your-subdomain>.workers.dev
```

## 2. Set up GitHub Secrets

Go to your repo Settings → Secrets and add:

```
CLOUDFLARE_WORKER_URL = https://blanksheet-worker.<your-subdomain>.workers.dev
CLOUDFLARE_EXPORT_SECRET = <the hex string from step 1>
```

## 3. Add GitHub Actions Workflow

Copy `.github-workflows-sync-logs.yml` to `.github/workflows/sync-logs.yml`

```bash
mkdir -p .github/workflows
mv .github-workflows-sync-logs.yml .github/workflows/sync-logs.yml
```

This will automatically:
- Run every 6 hours (customizable via cron)
- Pull all prompt logs from your Cloudflare Worker
- Commit them to `logs/prompt-filter-log.json` in the repo
- Make them available for training/analysis

## 4. Update Frontend Environment Variables

In your `.env.production` (or wherever you build for prod):

```
VITE_PROMPT_LOG_URL=https://blanksheet-worker.<your-subdomain>.workers.dev/api/prompt-log
VITE_ANALYTICS_URL=https://blanksheet-worker.<your-subdomain>.workers.dev/api/analytics
```

In your `p__projectId__7_.tsx`, after the Dashboard mounts, track the visit:

```typescript
useEffect(() => {
  // Track this visit for analytics
  trackVisit();
}, []);
```

Import `trackVisit` from `./promptLog`.

## 5. Use Collected Logs for Training

See `scripts/analyze-and-improve-filter.ts` for a tool that:
- Analyzes false positives / false negatives in collected logs
- Suggests rule improvements to the prompt filter
- Can even auto-generate new regex patterns from misclassified prompts

Run it locally after syncing logs:
```bash
bun run scripts/analyze-and-improve-filter.ts
```

## Architecture Summary

```
User's localhost:3000
    ↓ (opt-in logging)
Cloudflare Worker (global, always-on)
    ├→ /api/prompt-log (POST: logs entries to KV)
    ├→ /api/analytics (POST: tracks visits)
    └→ /api/prompt-log/export (GET: exports all logs)
           ↓ (every 6 hours, via GitHub Actions)
    GitHub Repo (logs/prompt-filter-log.json)
           ↓ (optional: manual or auto analysis)
    Improved Prompt Filter Rules
```

All user data stays secure:
- No API keys ever leave user's machine (they're used client-side)
- Prompt data is sent to Cloudflare only if user opts in
- Cloudflare data never goes back to users' machines
- Logs are committed to your private GitHub repo
- Everything happens on your infra, under your control
