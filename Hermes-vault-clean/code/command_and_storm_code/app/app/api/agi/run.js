import { NextResponse } from 'next/server'
import { execSync } from 'child_process'
import { logInfo, logError } from '../../../../lib/logger'
import path from 'path'

export async function POST() {
  try {
    logInfo('AGI Run requested')
    // Run the orchestrator synchronously from multiple known locations
    const candidates = [
      path.resolve('.', 'scripts/agi_orchestrator.js'),
      path.resolve('C:\\Users\\thepr\\Downloads\\command and storm code\\scripts\\agi_orchestrator.js'),
      path.resolve('D:\\command and storm code\\scripts\\agi_orchestrator.js'),
    ];
    let found = false;
    for (const c of candidates) {
      try {
        if (require('fs').existsSync(c)) {
          execSync(`node "${c}"`, { stdio: 'inherit' });
          found = true; break;
        }
      } catch {
        // try next
      }
    }
    if (!found) {
      // Fallback to absolute path if one exists elsewhere
      const abs = path.resolve('C:\\Users\\thepr\\Downloads\\command and storm code\\scripts\\agi_orchestrator.js');
    execSync(`node "${abs}"`, { stdio: 'inherit' });
    }
  } catch (err) {
    logError('AGI Run error: ' + (err && err.message ? err.message : err))
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
  let flow = null
  try {
    const fs = require('fs')
    const r = require('path')
    const fp = path.resolve('.', 'flow_output.json')
    flow = JSON.parse(fs.readFileSync(fp, 'utf-8'))
  } catch {
    flow = null
  }
  return NextResponse.json({ ok: true, flow })
}
