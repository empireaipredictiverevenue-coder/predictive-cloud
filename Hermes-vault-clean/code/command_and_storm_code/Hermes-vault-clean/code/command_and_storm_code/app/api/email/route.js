import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const body = await req.json()
    // On-demand dynamic import to avoid build-time resolution of 'resend'
    let client = null
    try {
      const mod = await import('resend')
      const Resend = mod.Resend || mod.default
      if (Resend) {
        client = new Resend(process.env.RESEND_API_KEY)
      }
    } catch {
      client = null
    }
    return NextResponse.json({ success: true, usingResend: !!client })
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}
