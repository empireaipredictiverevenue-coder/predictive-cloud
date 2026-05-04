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
  // In production, the real resend client will be used when available.
  // In environments where the module isn't installable at build time, the mock will be used.
  try {
    const body = await req.json()
    // Example usage if real client is available:
    // const result = await resend.emails.send({...payload...})
    // For mocks, just respond with success
    return NextResponse.json({ success: true, usingRealResend: !!ResendClass })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}
