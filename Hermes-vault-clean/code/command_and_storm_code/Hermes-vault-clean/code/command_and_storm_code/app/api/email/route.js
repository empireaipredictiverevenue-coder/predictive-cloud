import { NextResponse } from 'next/server'

let resend
try {
  const { Resend } = require('resend')
  resend = new Resend(process.env.RESEND_API_KEY)
} catch {
  resend = { emails: { send: async () => ({}) } }
}

export async function POST(req) {
  try {
    const body = await req.json()
    // Real call would be: await resend.emails.send(payload)
    return NextResponse.json({ success: true, usingResend: !!resend?.emails?.send })
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}
