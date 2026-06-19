// scripts/analyze-and-improve-filter.ts
// Analyzes collected prompt logs from logs/prompt-filter-log.json and suggests
// improvements to the prompt filter based on false positives/negatives.
//
// Run: bun run scripts/analyze-and-improve-filter.ts

import fs from "fs";
import path from "path";

interface PromptLogEntry {
  timestamp: string;
  userId: string;
  prompt: string;
  blocked: boolean;
  reason?: string;
  sanitized?: string;
}

interface AnalysisResult {
  totalEntries: number;
  blockedCount: number;
  allowedCount: number;
  blockReasons: Record<string, number>;
  falsePositiveCandidates: PromptLogEntry[];
  falseNegativeCandidates: PromptLogEntry[];
  topBlockedPatterns: string[];
  recommendations: string[];
}

function loadLogs(): PromptLogEntry[] {
  const logPath = path.join(process.cwd(), "logs", "prompt-filter-log.json");
  if (!fs.existsSync(logPath)) {
    console.error(`No log file found at ${logPath}`);
    process.exit(1);
  }
  const raw = fs.readFileSync(logPath, "utf-8");
  return JSON.parse(raw) as PromptLogEntry[];
}

function analyzeLogs(entries: PromptLogEntry[]): AnalysisResult {
  const blockReasons: Record<string, number> = {};
  const topBlocked = new Map<string, number>();

  // Group by block reason and collect patterns
  for (const entry of entries) {
    if (entry.blocked && entry.reason) {
      blockReasons[entry.reason] = (blockReasons[entry.reason] || 0) + 1;

      // Extract common keywords from blocked prompts to find patterns
      const words = entry.prompt.toLowerCase().match(/\b\w+\b/g) || [];
      for (const word of words) {
        if (word.length > 4) {
          topBlocked.set(word, (topBlocked.get(word) || 0) + 1);
        }
      }
    }
  }

  // Find potential false positives (blocked, but might have been legitimate)
  // Heuristic: blocked for "prompt injection" but contains no actual jailbreak vocab
  const falsePositives = entries.filter(
    (e) =>
      e.blocked &&
      e.reason?.includes("injection") &&
      !/(ignore|override|jailbreak|dan|pretend)/i.test(e.prompt)
  );

  // Find potential false negatives (allowed, but might contain risky keywords)
  const falseNegatives = entries.filter(
    (e) =>
      !e.blocked &&
      /(malware|ransomware|bomb|exploit|hack|crack|keylogger)/i.test(e.prompt)
  );

  // Generate recommendations based on analysis
  const recommendations: string[] = [];

  if (falsePositives.length > entries.filter((e) => e.blocked).length * 0.2) {
    recommendations.push(
      `⚠️  High false-positive rate (${falsePositives.length}/${entries.filter((e) => e.blocked).length}). ` +
        `Consider loosening regex patterns or improving context detection.`
    );
  }

  if (falseNegatives.length > entries.length * 0.05) {
    recommendations.push(
      `⚠️  Found ${falseNegatives.length} potential false negatives. ` +
        `Some risky requests may have slipped through. Review and tighten patterns.`
    );
  }

  const topBlockReason = Object.entries(blockReasons).sort(([, a], [, b]) => b - a)[0];
  if (topBlockReason && topBlockReason[1] > entries.length * 0.3) {
    recommendations.push(
      `📊 Most blocks are: "${topBlockReason[0]}" (${topBlockReason[1]} times). ` +
        `Consider if this rule is too broad or if users need clearer feedback.`
    );
  }

  // Top patterns in blocked prompts
  const topPatterns = Array.from(topBlocked.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);

  if (topPatterns.some((w) => w.length > 3)) {
    recommendations.push(
      `💡 Most common words in blocked prompts: ${topPatterns.join(", ")}. ` +
        `Consider if new patterns emerge that should be explicitly handled.`
    );
  }

  return {
    totalEntries: entries.length,
    blockedCount: entries.filter((e) => e.blocked).length,
    allowedCount: entries.filter((e) => !e.blocked).length,
    blockReasons,
    falsePositiveCandidates: falsePositives.slice(0, 10),
    falseNegativeCandidates: falseNegatives.slice(0, 10),
    topBlockedPatterns: topPatterns,
    recommendations,
  };
}

function printReport(result: AnalysisResult) {
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║        Prompt Filter Analysis Report                   ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");

  console.log(`\n📊 PII Redaction Stats:`);
  const redactedEntries = entries.filter((e) => e.hadPIIRedactions);
  const redactionRate = ((redactedEntries.length / entries.length) * 100).toFixed(1);
  console.log(`   Entries with redacted PII: ${redactedEntries.length} (${redactionRate}%)`);
  console.log(`   Entries with no PII: ${entries.length - redactedEntries.length}`);

  console.log(`\n📈 Overall Stats:`);
  console.log(`   Total Entries: ${result.totalEntries}`);
  console.log(`   Blocked: ${result.blockedCount} (${((result.blockedCount / result.totalEntries) * 100).toFixed(1)}%)`);
  console.log(`   Allowed: ${result.allowedCount} (${((result.allowedCount / result.totalEntries) * 100).toFixed(1)}%)\n`);

  console.log(`🚫 Block Reasons (Top 5):`);
  Object.entries(result.blockReasons)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .forEach(([reason, count]) => {
      console.log(`   • ${reason}: ${count}`);
    });

  if (result.falsePositiveCandidates.length > 0) {
    console.log(`\n⚠️  Potential False Positives (${result.falsePositiveCandidates.length}):`);
    result.falsePositiveCandidates.slice(0, 3).forEach((entry) => {
      console.log(
        `   • "${entry.prompt.slice(0, 80)}..." - reason: ${entry.reason}`
      );
    });
  }

  if (result.falseNegativeCandidates.length > 0) {
    console.log(`\n❌ Potential False Negatives (${result.falseNegativeCandidates.length}):`);
    result.falseNegativeCandidates.slice(0, 3).forEach((entry) => {
      console.log(`   • "${entry.prompt.slice(0, 80)}..."`);
    });
  }

  console.log(`\n💡 Recommendations:`);
  if (result.recommendations.length === 0) {
    console.log(`   ✓ Filter is performing well! No major issues detected.`);
  } else {
    result.recommendations.forEach((rec) => {
      console.log(`   ${rec}`);
    });
  }

  console.log(`\n📊 Save this report: bun run scripts/analyze-and-improve-filter.ts > filter-analysis.txt\n`);
}

// Main
const logs = loadLogs();
console.log(`\nLoaded ${logs.length} prompt log entries from logs/prompt-filter-log.json`);

const analysis = analyzeLogs(logs);
printReport(analysis);

// Optionally save detailed results as JSON
const resultsFile = path.join(process.cwd(), "filter-analysis.json");
fs.writeFileSync(resultsFile, JSON.stringify(analysis, null, 2));
console.log(`📁 Detailed analysis saved to: ${resultsFile}`);
