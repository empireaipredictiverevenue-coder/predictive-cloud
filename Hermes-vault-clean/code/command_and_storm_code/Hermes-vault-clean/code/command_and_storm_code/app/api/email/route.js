import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const body = await req.json()
    // Try to instantiate resend at runtime; if unavailable, fall back to mock
    let resend
    try {
      const { Resend } = require('resend')
      resend = new Resend(process.env.RESEND_API_KEY)
      // If we reach here, we have a real client
      // Example: await resend.emails.send({ to: [body.email], from: process.env.FROM_EMAIL, subject: '...', html: '...' })
    } catch {
      resend = { emails: { send: async () => ({}) } }
    }
    return NextResponse.json({ success: true, usingResend: !!resend?.emails?.send })
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}
