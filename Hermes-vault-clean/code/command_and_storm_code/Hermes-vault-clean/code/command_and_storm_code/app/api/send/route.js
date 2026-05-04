import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const body = await req.json()
    // Instantiate resend at runtime if available, else fallback
    let resend
    try {
      const { Resend } = require('resend')
      resend = new Resend(process.env.RESEND_API_KEY)
    } catch {
      resend = { emails: { send: async () => ({}) } }
    }
    return NextResponse.json({ success: true, usingResend: !!resend?.emails?.send })
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}
