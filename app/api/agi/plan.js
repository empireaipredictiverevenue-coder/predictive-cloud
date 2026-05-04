import { NextResponse } from 'next/server'
const planner = require('../../../../scripts/agi_planner')

export async function GET() {
  const objective = 'Lead generation'
  const plan = planner.plan ? planner.plan(objective) : []
  return NextResponse.json({ objective, plan })
}
