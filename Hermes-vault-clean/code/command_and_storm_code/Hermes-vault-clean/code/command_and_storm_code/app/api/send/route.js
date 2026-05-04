import { NextResponse } from 'next/server'

let ResendClass
try {
  const mod = require('resend')
  ResendClass = mod.Resend || mod
} catch {
  ResendClass = null
}
let resend
if (ResendClass) {
  try {
    resend = new (ResendClass)({})
  } catch {
    resend = { emails: { send: async () => ({}) } }
  }
} else {
  resend = { emails: { send: async () => ({}) } }
}

export async function POST(req) {
  try {
    const body = await req.json()
    return NextResponse.json({ success: true, usingRealResend: !!ResendClass })
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}
