import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend client with API key from env
const resend = new Resend(process.env.RESEND_API_KEY);

// Steel Frame template aligned with Empire AI branding (neon green + cyan)
function buildEmailHtml(body = '') {
  // Basic HTML escaping to safely render user-provided content
  const safe = (body || '').replace(/[&<>"']/g, (m) =>
    ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m] || m)
  );

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Empire AI — Message</title>
    </head>
    <body style="margin:0; padding:0; background:#0b0f14; font-family: Arial, Helvetica, sans-serif; color:#e6e6e6;">
      <div style="max-width:640px; margin:40px auto; padding:0; border:2px solid #00E5FF; border-radius:8px; background:#0f141b; box-shadow:0 0 0 1px rgba(0,0,0,.2) inset;">
        <!-- Steel Frame Header (Branding) -->
        <div style="background: linear-gradient(#0b0f14, #0b0f14); border-bottom:1px solid rgba(0,196,255,.4); padding:18px 24px; display:flex; align-items:center; justify-content:space-between;">
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="width:28px; height:28px; border-radius:6px; background:#39FF14; display:inline-block;"></span>
            <div>
              <div style="font-weight:900; font-size:18px; letter-spacing:1px; color:#eafff1;">Empire AI</div>
              <div style="font-size:11px; color:#00E5FF;">Systems Online</div>
            </div>
          </div>
          <div style="font-size:12px; color:#9bd7b9;">Branding • Steel Frame Template</div>
        </div>
        <!-- Content -->
        <div style="padding:24px; background:#0b0f14;">
          <div style="font-size:14px; line-height:1.6; color:#e8f3f0;">
            <p>${safe}</p>
          </div>
        </div>
        <!-- Footer -->
        <div style="padding:12px 24px; text-align:center; font-size:11px; color:#7b8a97; border-top:1px solid rgba(0,0,0,.2); background:#0b0f14;">
          This email was sent via Resend. If you have questions, contact your system administrator.
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function POST(request) {
  try {
    const { to, subject, text } = await request.json();

    // Basic validation
    if (!to || !text) {
      return NextResponse.json({ error: 'Missing required fields: to and text' }, { status: 400 });
    }

    // Build HTML content using the Steel Frame template
    const html = buildEmailHtml(text);

    // Resolve From header from environment (Namecheap identity)
    const fromAddress = process.env.FROM_ADDRESS;
    const fromName = process.env.FROM_NAME || 'Empire AI';
    if (!fromAddress) {
      return NextResponse.json({ error: 'Server misconfiguration: FROM_ADDRESS not set' }, { status: 500 });
    }
    const fromHeader = `"${fromName}" <${fromAddress}>`;

    // Send email via Resend
    await resend.emails.send({ to, from: fromHeader, subject: subject ?? 'Empire AI Message', html, text });

    return NextResponse.json({ ok: true, to, subject });
  } catch (err) {
    // Log and return a generic error to avoid leaking internals
    console.error('Email send error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
