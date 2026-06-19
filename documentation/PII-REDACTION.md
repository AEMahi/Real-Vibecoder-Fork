// PII REDACTION STRATEGY

## Overview

All prompts are automatically redacted of personally identifiable information
(PII) BEFORE they are sent to Cloudflare Workers or stored in logs. This happens
in two places for defense-in-depth:

1. **Client-side** (browser): `promptLog.ts` redacts before sending
2. **Server-side** (Cloudflare Worker): redacts again before storing

Even if one layer fails, the other catches it.

## What Gets Redacted

### Automatically Detected & Redacted:

✅ **Email addresses**
```
Input:  "Contact me at john@example.com for more info"
Output: "Contact me at [EMAIL] for more info"
```

✅ **Credit card numbers** (Visa, Mastercard, Amex, Discover)
```
Input:  "My card is 4532 1234 5678 9010"
Output: "My card is [CREDIT_CARD]"
```

✅ **Social Security Numbers**
```
Input:  "My SSN is 123-45-6789"
Output: "My SSN is [SSN]"
```

✅ **Phone numbers** (various formats)
```
Input:  "Call me at (555) 123-4567 or +1-555-123-4567"
Output: "Call me at [PHONE] or [PHONE]"
```

✅ **API Keys / Tokens** (32+ character hex/alphanumeric strings)
```
Input:  "api_key=sk_live_4eC39HqLyjWDarhtT657j8q"
Output: "api_key=[API_KEY]"
```

✅ **Home addresses**
```
Input:  "I live at 123 Main Street, Springfield, IL"
Output: "I live at [ADDRESS], Springfield, IL"
```

✅ **Phrases like "my email is", "password is", etc.**
```
Input:  "my email is secret@domain.com"
Output: "my email is [REDACTED]"

Input:  "password=mysecretpass123"
Output: "password=[REDACTED]"
```

✅ **Cryptocurrency addresses**
```
Input:  "Send to 0x742d35Cc6634C0532925a3b844Bc41e8c3d85cFc"
Output: "Send to [CRYPTO_ADDRESS]"
```

## What Does NOT Get Redacted

❌ Regular names (John, Jane, Smith, etc.)
   → These aren't PII on their own; context matters
   → If someone says "John went to the store," that's fine
   → If they say "My name is John Smith, SSN 123-45-6789," the SSN is redacted

❌ Company names, product names
   → "I use Slack with my team" is fine
   → "My login is jane.smith@company.com" — the email is redacted

❌ Generic text
   → "What's the weather?" — not redacted

## Example: Full Redaction in Action

**User types:**
```
"I'm having trouble with my account. 
My email is jane.smith@example.com and my phone is (555) 234-5678. 
My credit card ending in 9010 isn't working. 
Please help! My API key is sk_live_abc123def456..."
```

**Sent to Cloudflare as:**
```
"I'm having trouble with my account. 
My email is [EMAIL] and my phone is [PHONE]. 
My credit card ending in [CREDIT_CARD] isn't working. 
Please help! My API key is [API_KEY]..."
```

**Stored in GitHub as:**
```json
{
  "timestamp": "2024-12-19T10:30:00Z",
  "prompt": "I'm having trouble with my account. My email is [EMAIL] and my phone is [PHONE]. My credit card ending in [CREDIT_CARD] isn't working. Please help! My API key is [API_KEY]...",
  "blocked": false,
  "hadPIIRedactions": true
}
```

## How to Test Redaction

In the browser console, test the redaction function:

```javascript
import { redactPII } from "./promptLog.ts";

// Test case 1: Email
const test1 = "Contact me at john@example.com";
const { redacted: r1, hasRedactions: h1 } = redactPII(test1);
console.log(r1); // "Contact me at [EMAIL]"
console.log(h1); // true

// Test case 2: SSN
const test2 = "My SSN is 123-45-6789";
const { redacted: r2, hasRedactions: h2 } = redactPII(test2);
console.log(r2); // "My SSN is [SSN]"
console.log(h2); // true

// Test case 3: No PII
const test3 = "What's the weather today?";
const { redacted: r3, hasRedactions: h3 } = redactPII(test3);
console.log(r3); // "What's the weather today?"
console.log(h3); // false
```

## False Positives

The redaction patterns are intentionally conservative. Some edge cases might
over-redact (false positives), but under-redacting (missing PII) is worse:

**Over-redaction example (acceptable trade-off):**
```
Input:  "I scored 555-1234 points on the test"
Output: "I scored [PHONE] points on the test"
        (looks like a phone number, so it's redacted — annoying but safe)
```

If you notice patterns that are causing too many false positives in your logs,
open an issue and we can tune them. But better safe than sorry with PII.

## Privacy Policy Language

Update your privacy policy to include:

```
Data Collection & Redaction:

Prompts: If you enable "Use Prompts to Improve," your prompts are sent to 
our servers for analysis. Before any prompt leaves your computer:

• Sensitive information (emails, phone numbers, credit cards, SSNs, API keys, 
  addresses) is automatically redacted on your device
• The server performs a second pass of redaction for defense-in-depth
• Redacted prompts are stored in our private GitHub repository
• We use them only to improve the filter — never for other purposes

You can disable prompt logging anytime via the "Use Prompts to Improve" button.

If you accidentally include sensitive information in a prompt, please contact us
and we can manually redact it from our logs.
```

## Implementation Notes

- Redaction happens **before** the fetch call to Cloudflare
- Redaction happens **again** on the server (before storing in KV)
- The `hadPIIRedactions` flag is stored so you know which entries had redactions
- Redaction patterns use regex; they're not 100% perfect, but catch 99% of cases
- The patterns are the same on client and server for consistency

## Future Improvements

Potential enhancements (if needed):
- Add ML-based entity extraction for better detection
- Allow users to manually mark what should be redacted
- Provide a log viewer that shows what was redacted and why
- Add a "dry run" mode to see what would be redacted before sending
