#!/usr/bin/env node

// scripts/sync-prompt-logs.js
// Pulls prompt logs from Cloudflare Worker and writes to logs/prompt-filter-log.json
// for committing to the repo and using as training data for the filter.

const fs = require("fs");
const path = require("path");

const WORKER_URL = process.env.CLOUDFLARE_WORKER_URL;
const EXPORT_SECRET = process.env.CLOUDFLARE_EXPORT_SECRET;

if (!WORKER_URL || !EXPORT_SECRET) {
  console.error("Error: Missing CLOUDFLARE_WORKER_URL or CLOUDFLARE_EXPORT_SECRET env vars");
  process.exit(1);
}

async function syncLogs() {
  try {
    console.log("Fetching prompt logs from Cloudflare Worker...");

    const response = await fetch(`${WORKER_URL}/api/prompt-log/export`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${EXPORT_SECRET}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch logs: ${response.status} ${response.statusText}`);
    }

    const logs = await response.json();
    console.log(`Received ${logs.length} prompt log entries`);

    // Ensure logs directory exists
    const logsDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Write logs to file
    const logFile = path.join(logsDir, "prompt-filter-log.json");
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
    console.log(`Wrote ${logs.length} entries to ${logFile}`);

    // Also fetch and display analytics
    console.log("\nFetching analytics...");
    const analyticsResponse = await fetch(`${WORKER_URL}/api/analytics/export`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${EXPORT_SECRET}`,
        "Content-Type": "application/json",
      },
    });

    if (analyticsResponse.ok) {
      const analytics = await analyticsResponse.json();
      console.log(`\n📊 Analytics Summary:`);
      console.log(`   Unique Users: ${analytics.uniqueUsers?.length || 0}`);
      console.log(`   Total Visits: ${analytics.totalVisits || 0}`);
      console.log(`   Blocked Prompts: ${logs.filter((l) => l.blocked).length}`);
      console.log(`   Allowed Prompts: ${logs.filter((l) => !l.blocked).length}`);
      console.log(`   Last Updated: ${analytics.lastUpdated || "N/A"}`);
    }
  } catch (error) {
    console.error("Error syncing logs:", error);
    process.exit(1);
  }
}

syncLogs();
