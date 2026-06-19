// QUICK FILE PLACEMENT REFERENCE

Copy/move these files to your Real-Vibecoder project:

## Step 1: Frontend Code (src/)

```
src/
├── promptLog.ts
│   ← Copy the updated promptLog.ts here
│   (includes PII redaction + analytics tracking)
│
└── routes/p/
    └── [YOUR_DASHBOARD_FILE].tsx
        ← Update this file to add trackVisit() import and call
        (see DASHBOARD-INTEGRATION.md for exact changes)
```

**Command:**
```bash
cp promptLog.ts src/
# Then manually edit your dashboard file per DASHBOARD-INTEGRATION.md
```

## Step 2: GitHub Actions Workflow (.github/workflows/)

```
.github/
└── workflows/
    └── sync-logs.yml
        ← Copy from .github-workflows-sync-logs.yml
        (This runs every 6 hours to sync logs from Cloudflare)
```

**Command:**
```bash
mkdir -p .github/workflows
cp .github-workflows-sync-logs.yml .github/workflows/sync-logs.yml
```

## Step 3: Backend Scripts (scripts/)

```
scripts/
├── sync-prompt-logs.js
│   ← Copy this file here
│   (Pulls logs from Cloudflare, called by GitHub Actions)
│
├── analyze-and-improve-filter.ts
│   ← Copy this file here
│   (Run manually to analyze logs and suggest improvements)
│
└── (optional) redaction.test.ts
    ← Copy to scripts/ or tests/
    (Tests the PII redaction patterns)
```

**Command:**
```bash
mkdir -p scripts
cp sync-prompt-logs.js scripts/
cp analyze-and-improve-filter.ts scripts/
cp tests-redaction.test.ts scripts/redaction.test.ts
```

## Step 4: Cloudflare Worker (project root)

```
Real-Vibecoder/
├── cloudflare-worker.ts
│   ← Copy this file to project root
│   (The actual worker code)
│
└── wrangler.toml
    ← Copy this file to project root
    (Configuration for deploying the worker)
```

**Command:**
```bash
cp cloudflare-worker.ts ./
cp wrangler.toml ./
```

## Step 5: Logs Directory (auto-created by GitHub Actions)

```
logs/
└── prompt-filter-log.json
    ← YOU DON'T CREATE THIS
    (Automatically created and updated by GitHub Actions)
    (Add this path to .gitignore initially, GitHub Actions will create it)
```

**Command:**
```bash
# Just make sure the logs/ directory exists:
mkdir -p logs
# Don't add anything to it yet — GitHub Actions will populate it
```

## Complete Copy-Paste Commands

Run these in order from your Real-Vibecoder root:

```bash
# 1. Frontend files
cp promptLog.ts src/

# 2. GitHub Actions
mkdir -p .github/workflows
cp .github-workflows-sync-logs.yml .github/workflows/sync-logs.yml

# 3. Backend scripts
mkdir -p scripts
cp sync-prompt-logs.js scripts/
cp analyze-and-improve-filter.ts scripts/
cp tests-redaction.test.ts scripts/redaction.test.ts

# 4. Cloudflare Worker
cp cloudflare-worker.ts ./
cp wrangler.toml ./

# 5. Create logs directory (GitHub Actions will use this)
mkdir -p logs

# 6. (Optional) Create tests directory if you don't have one
mkdir -p tests
cp tests-redaction.test.ts tests/
```

## Then: Manual Updates

After copying files, you need to manually edit:

1. **`src/routes/p/[YOUR_DASHBOARD_FILE].tsx`**
   - Add import: `import { trackVisit } from "../promptLog"`
   - Add in useEffect on mount: `trackVisit()`
   - See DASHBOARD-INTEGRATION.md for exact code

2. **`wrangler.toml`**
   - After first `wrangler deploy`, fill in the KV namespace IDs
   - See SETUP-GUIDE.md for details

3. **`.env.production`**
   - Add: `VITE_PROMPT_LOG_URL=https://your-worker-url/api/prompt-log`
   - Add: `VITE_ANALYTICS_URL=https://your-worker-url/api/analytics`

4. **GitHub Secrets** (in repo settings)
   - `CLOUDFLARE_WORKER_URL` = your deployed worker URL
   - `CLOUDFLARE_EXPORT_SECRET` = random 32-char hex string

## File Checklist

Copy these files:
- [ ] `promptLog.ts` → `src/promptLog.ts`
- [ ] `.github-workflows-sync-logs.yml` → `.github/workflows/sync-logs.yml`
- [ ] `scripts-sync-prompt-logs.js` → `scripts/sync-prompt-logs.js`
- [ ] `scripts-analyze-and-improve-filter.ts` → `scripts/analyze-and-improve-filter.ts`
- [ ] `tests-redaction.test.ts` → `tests/redaction.test.ts`
- [ ] `cloudflare-worker.ts` → `cloudflare-worker.ts` (project root)
- [ ] `wrangler.toml` → `wrangler.toml` (project root)

Update these files:
- [ ] `src/routes/p/[YOUR_DASHBOARD].tsx` (add trackVisit)
- [ ] `wrangler.toml` (add KV namespace IDs after deploy)
- [ ] `.env.production` (add VITE_PROMPT_LOG_URL, VITE_ANALYTICS_URL)
- [ ] GitHub Secrets (add CLOUDFLARE_WORKER_URL, CLOUDFLARE_EXPORT_SECRET)

Create these directories (if they don't exist):
- [ ] `mkdir -p src/`
- [ ] `mkdir -p .github/workflows/`
- [ ] `mkdir -p scripts/`
- [ ] `mkdir -p tests/`
- [ ] `mkdir -p logs/`

## Notes

- Files from `/mnt/user-data/outputs/` with names like `.github-workflows-sync-logs.yml` should be renamed when you copy them
  - `.github-workflows-sync-logs.yml` → `.github/workflows/sync-logs.yml`
  - `scripts-sync-prompt-logs.js` → `scripts/sync-prompt-logs.js` (note: dash → slash)
  - `tests-redaction.test.ts` → `tests/redaction.test.ts`

- Don't copy documentation files (ARCHITECTURE.md, SETUP-GUIDE.md, etc.) — just read them for reference

- The `promptFilter.ts` you already have doesn't need to be replaced — you already got the updated version earlier

- Run the redaction tests before deploying to make sure PII redaction works:
  ```bash
  bun run tests/redaction.test.ts
  ```
