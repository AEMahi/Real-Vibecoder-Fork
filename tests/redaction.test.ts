// tests/redaction.test.ts
// Quick tests to verify PII redaction is working correctly

import { redactPII } from "../src/promptLog";

const testCases = [
  {
    name: "Email address",
    input: "Contact me at john.doe@example.com for details",
    expectedContains: "[EMAIL]",
  },
  {
    name: "Multiple emails",
    input: "My email is alice@test.com and backup is bob@test.org",
    expectedContains: "[EMAIL]",
  },
  {
    name: "Credit card number",
    input: "My card is 4532-1234-5678-9010",
    expectedContains: "[CREDIT_CARD]",
  },
  {
    name: "SSN",
    input: "Social security number: 123-45-6789",
    expectedContains: "[SSN]",
  },
  {
    name: "Phone number (formatted)",
    input: "Call me at (555) 123-4567",
    expectedContains: "[PHONE]",
  },
  {
    name: "Phone number (dashes)",
    input: "Reach me at 555-123-4567",
    expectedContains: "[PHONE]",
  },
  {
    name: "API key",
    input: "My API key is sk_live_4eC39HqLyjWDarhtT657j8q",
    expectedContains: "[API_KEY]",
  },
  {
    name: "Address",
    input: "I live at 123 Main Street, Springfield",
    expectedContains: "[ADDRESS]",
  },
  {
    name: "Phrase: my email is",
    input: "my email is secret@domain.com",
    expectedContains: "[REDACTED]",
  },
  {
    name: "Phrase: password is",
    input: "password is mysecret123",
    expectedContains: "[REDACTED]",
  },
  {
    name: "Crypto address (Ethereum)",
    input: "Send to 0x742d35Cc6634C0532925a3b844Bc41e8c3d85cFc",
    expectedContains: "[CRYPTO_ADDRESS]",
  },
  {
    name: "No PII - should not redact",
    input: "What's the weather today?",
    shouldNotContain: ["[EMAIL]", "[PHONE]", "[REDACTED]"],
  },
  {
    name: "Name alone (not redacted)",
    input: "My name is John Smith",
    shouldNotContain: ["[REDACTED]"],
  },
  {
    name: "Complex: mixed PII",
    input:
      "Hi, I'm Jane Doe. Email me at jane@example.com or call 555-123-4567. My credit card is 1234-5678-9012-3456.",
    expectedContains: "[EMAIL]",
  },
];

// Run tests
let passed = 0;
let failed = 0;

console.log("\n╔════════════════════════════════════════════════════════╗");
console.log("║        PII Redaction Tests                             ║");
console.log("╚════════════════════════════════════════════════════════╝\n");

for (const testCase of testCases) {
  const { redacted, hasRedactions } = redactPII(testCase.input);

  let testPassed = true;
  const failures: string[] = [];

  // Check for expected redactions
  if (testCase.expectedContains) {
    if (!redacted.includes(testCase.expectedContains)) {
      testPassed = false;
      failures.push(
        `Expected to find "${testCase.expectedContains}" in output`
      );
    }
  }

  // Check for things that should NOT be redacted
  if (testCase.shouldNotContain) {
    for (const pattern of testCase.shouldNotContain) {
      if (redacted.includes(pattern)) {
        testPassed = false;
        failures.push(`Should NOT contain "${pattern}" but it does`);
      }
    }
  }

  if (testPassed) {
    console.log(`✅ ${testCase.name}`);
    console.log(`   Input:  "${testCase.input.slice(0, 60)}..."`);
    console.log(`   Output: "${redacted.slice(0, 60)}..."`);
    passed++;
  } else {
    console.log(`❌ ${testCase.name}`);
    console.log(`   Input:  "${testCase.input}"`);
    console.log(`   Output: "${redacted}"`);
    failures.forEach((f) => console.log(`   Error: ${f}`));
    failed++;
  }
  console.log();
}

// Summary
console.log("╔════════════════════════════════════════════════════════╗");
console.log(`║ Results: ${passed} passed, ${failed} failed                      ║`);
console.log("╚════════════════════════════════════════════════════════╝\n");

if (failed > 0) {
  process.exit(1);
}
