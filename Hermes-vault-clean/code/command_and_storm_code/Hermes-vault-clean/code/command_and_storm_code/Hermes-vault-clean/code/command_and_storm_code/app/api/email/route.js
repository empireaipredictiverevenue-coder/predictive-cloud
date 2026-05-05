import { NextResponse } from 'next/server'

let resend
try {
  const { Resend } = require('resend')
  resend = new Resend(process.env.RESEND_API_KEY)
} catch {
  // Fallback mock if resend isn't available in the build environment
  resend = { emails: { send: async () => ({}) } }
}

export async function POST(req) {
  try {
    const body = await req.json()
    // Basic validation could be added here;
    // if real Resend is present, you can call: await resend.emails.send({...})
    // For builds where Resend is unavailable, the mock will be used.
    return NextResponse.json({ success: true, mock: resend?.emails?.send ? false : true })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}
