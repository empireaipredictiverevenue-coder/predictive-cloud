// Local AGI test runner: invokes the orchestrator and prints a summary
const path = require('path');
let runFlow;
try {
  runFlow = require('./agi_orchestrator').runFlow;
} catch (e) {
  console.error('AGI test runner: failed to load orchestrator:', e.message);
  process.exit(1);
}

async function main() {
  try {
    const result = await runFlow();
    console.log('AGI test run completed. Flow result:', result);
  } catch (err) {
    console.error('AGI test run failed:', err?.message || err);
    process.exit(1);
  }
}

main();
