#!/usr/bin/env node
// Quick, one-click check for key presence in environment variables

const keys = [
  { name: 'RUNWAY_API_KEY', value: process.env.RUNWAY_API_KEY },
  { name: 'GOOGLE_API_KEY', value: process.env.GOOGLE_API_KEY },
  { name: 'RESEND_API_KEY', value: process.env.RESEND_API_KEY },
  { name: 'ANTHROPIC_API_KEY', value: process.env.ANTHROPIC_API_KEY },
  { name: 'OPENAI_API_KEY', value: process.env.OPENAI_API_KEY },
  { name: 'GROQ_API_KEY', value: process.env.GROQ_API_KEY },
  { name: 'GEMINI_API_KEY', value: process.env.GEMINI_API_KEY },
  { name: 'OLLAMA_HOST', value: process.env.OLLAMA_HOST },
];

const ok = (v) => typeof v === 'string' && v.length > 0;

console.log('=== Hermes Secrets Key Check ===');
let total = keys.length;
let present = 0;
keys.forEach(k => {
  const isPresent = ok(k.value);
  if (isPresent) present++;
  console.log(`- ${k.name}: ${isPresent ? '\u001b[32mpresent\u001b[0m' : '\u001b[31mmissing\u001b[0m'}`);
});

console.log(`Summary: ${present} of ${total} keys present`);
if (present === total) {
  console.log('\u001b[32mALL KEYS PRESENT — READY FOR PRODUCTION\u001b[0m');
} else {
  console.log('\u001b[33mSome keys are missing. Please add them to your secret store and environment.\u001b[0m');
}
