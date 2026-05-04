import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const fp = path.resolve('.', 'flow_output.json');
  let flow = null;
  try {
    const data = fs.readFileSync(fp, 'utf-8');
    flow = JSON.parse(data);
  } catch {
    flow = null;
  }
  const scheduleMin = parseInt(process.env.AGI_SCHEDULE_MINUTES || '15', 10);
  const lastRun = flow?.scrapedAt ?? null;
  let nextRun = null;
  if (lastRun) {
    try {
      const t = new Date(lastRun).getTime() + scheduleMin * 60000;
      nextRun = new Date(t).toISOString();
    } catch {
      nextRun = null;
    }
  }
  return NextResponse.json({ ok: true, flow, lastRun, nextRun, scheduleMin });
}
