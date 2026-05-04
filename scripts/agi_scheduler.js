#!/usr/bin/env node
// Simple AGI scheduler: runs the AGI orchestrator on a fixed interval
const { execSync } = require('child_process');

const MINUTES = parseInt(process.env.AGI_SCHEDULE_MINUTES || '60', 10);
const INTERVAL_MS = Math.max(60_000, MINUTES * 60_000);

function runOnce() {
  try {
    execSync('node scripts/agi_orchestrator.js', { stdio: 'inherit', cwd: process.cwd() });
  } catch (err) {
    console.error('[AGI Scheduler] Flow run failed:', err?.message || err);
  }
}

function startScheduler() {
  console.log(`[AGI Scheduler] Starting with interval ${MINUTES} minute(s)`);
  runOnce();
  setInterval(runOnce, INTERVAL_MS);
}

startScheduler();
module.exports = { startScheduler, runOnce };
