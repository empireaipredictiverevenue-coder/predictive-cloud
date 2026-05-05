import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('Missing RESEND_API_KEY');
  return new Resend(key);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildEmailHtml(name) {
  return `<h1>Welcome to Empire AI, ${name}</h1><p>Systems Online.</p>`;
}

export async function POST(request) {
  try {
    const { email, name = 'Operator' } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Missing email address' }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const fromAddress = process.env.FROM_ADDRESS;
    if (!fromAddress) {
      return NextResponse.json({ error: 'Server misconfiguration: FROM_ADDRESS not set' }, { status: 500 });
    }

    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: `Empire AI <${fromAddress}>`,
      to: [email],
      subject: 'Empire AI — Systems Online',
      html: buildEmailHtml(name),
    });

    if (error) throw error;

    console.log(`Onboarding email sent - id: ${data.id} | to: ${email} | operator: ${name}`);

    return NextResponse.json({
      success: true,
      message: 'Onboarding email dispatched',
      emailId: data.id,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Email Route Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
