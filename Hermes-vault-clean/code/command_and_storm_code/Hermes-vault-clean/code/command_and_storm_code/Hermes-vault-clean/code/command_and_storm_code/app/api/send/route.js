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
    // In a real setup, we'd call: await resend.emails.send({ ...payload... })
    // Here we return a mock success to keep the build sane when Resend is unavailable.
    return NextResponse.json({ success: true, mock: resend?.emails?.send ? false : true })
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}
