import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('Missing RESEND_API_KEY');
  return new Resend(key);
}

function buildEmailHtml(to) {
  return `<h1>Empire AI</h1><p>Message dispatched to ${to}.</p>`;
}

export async function POST(request) {
  try {
    const { to, subject, text } = await request.json();

    if (!to || !text) {
      return NextResponse.json({ error: 'Missing required fields: to and text' }, { status: 400 });
    }

    const fromAddress = process.env.FROM_ADDRESS;
    const fromName = process.env.FROM_NAME || 'Empire AI';
    if (!fromAddress) {
      return NextResponse.json({ error: 'Server misconfiguration: FROM_ADDRESS not set' }, { status: 500 });
    }

    const fromHeader = `"${fromName}" <${fromAddress}>`;

    const resend = getResend();
    await resend.emails.send({ to, from: fromHeader, subject: subject ?? 'Empire AI Message', html: buildEmailHtml(to), text });

    return NextResponse.json({ ok: true, to, subject });

  } catch (err) {
    console.error('Email send error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
