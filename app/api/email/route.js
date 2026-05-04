import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Email HTML Builder ───────────────────────────────────────────────────────

function buildEmailHtml(name) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Empire AI — Systems Online</title>
    </head>
    <body style="margin:0;padding:0;background:#020808;font-family:'Courier New',monospace;color:#ffffff;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#020808;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0"
              style="border:1px solid rgba(0,245,255,0.3);background:#040d0d;">

              <!-- Header -->
              <tr>
                <td style="padding:32px 40px 24px;border-bottom:1px solid rgba(0,245,255,0.2);">
                  <p style="margin:0 0 4px;font-size:10px;letter-spacing:4px;color:rgba(0,245,255,0.5);">
                    PREDICTIVE REVENUE SYSTEM
                  </p>
                  <h1 style="margin:0;font-size:28px;font-weight:900;letter-spacing:6px;color:#39ff14;">
                    EMPIRE AI
                  </h1>
                </td>
              </tr>

              <!-- Status Banner -->
              <tr>
                <td style="padding:0;">
                  <div style="background:linear-gradient(135deg,rgba(57,255,20,0.1),rgba(0,245,255,0.1));
                    border-bottom:1px solid rgba(0,245,255,0.2);padding:16px 40px;">
                    <p style="margin:0;font-size:11px;letter-spacing:3px;color:#00f5ff;">
                      ✅ SYSTEMS ONLINE — PREDICTIVE CLOUD ACTIVE
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:32px 40px;">
                  <p style="margin:0 0 16px;font-size:14px;color:rgba(0,245,255,0.7);letter-spacing:1px;">
                    WELCOME TO THE FLEET, ${name.toUpperCase()}.
                  </p>
                  <p style="margin:0 0 24px;font-size:13px;line-height:1.8;color:rgba(255,255,255,0.7);">
                    Predictive revenue for your dashboard is now active. The Empire AI
                    automated growth engine is online and monitoring your zone.
                  </p>

                  <!-- Status Table -->
                  <table width="100%" cellpadding="0" cellspacing="0"
                    style="border:1px solid rgba(0,245,255,0.2);font-size:10px;margin-bottom:24px;">
                    <tr style="border-bottom:1px solid rgba(0,245,255,0.1);">
                      <td style="padding:10px 16px;color:rgba(0,245,255,0.5);letter-spacing:2px;">OPERATOR</td>
                      <td style="padding:10px 16px;color:#39ff14;letter-spacing:2px;">${name.toUpperCase()}</td>
                    </tr>
                    <tr style="border-bottom:1px solid rgba(0,245,255,0.1);">
                      <td style="padding:10px 16px;color:rgba(0,245,255,0.5);letter-spacing:2px;">NEURAL ENGINE</td>
                      <td style="padding:10px 16px;color:#39ff14;letter-spacing:2px;">ACTIVE</td>
                    </tr>
                    <tr style="border-bottom:1px solid rgba(0,245,255,0.1);">
                      <td style="padding:10px 16px;color:rgba(0,245,255,0.5);letter-spacing:2px;">CRM PIPELINE</td>
                      <td style="padding:10px 16px;color:#39ff14;letter-spacing:2px;">LIVE</td>
                    </tr>
                    <tr style="border-bottom:1px solid rgba(0,245,255,0.1);">
                      <td style="padding:10px 16px;color:rgba(0,245,255,0.5);letter-spacing:2px;">SOLANA NETWORK</td>
                      <td style="padding:10px 16px;color:#39ff14;letter-spacing:2px;">CONNECTED</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 16px;color:rgba(0,245,255,0.5);letter-spacing:2px;">TIMESTAMP</td>
                      <td style="padding:10px 16px;color:#39ff14;letter-spacing:2px;">
                        ${new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC
                      </td>
                    </tr>
                  </table>

                  <!-- CTA -->
                  <div style="border:1px solid rgba(57,255,20,0.3);padding:24px;
                    background:rgba(57,255,20,0.04);margin-bottom:24px;">
                    <p style="margin:0 0 8px;font-size:10px;letter-spacing:3px;color:#39ff14;">
                      // NEXT DIRECTIVE
                    </p>
                    <p style="margin:0 0 16px;font-size:13px;color:rgba(255,255,255,0.8);line-height:1.6;">
                      Log in to your Empire AI dashboard to begin deploying predictive
                      revenue campaigns across your target zones.
                    </p>
                    <a href="https://yourdomain.com" style="display:inline-block;background:linear-gradient(135deg,#39ff14,#00f5ff);
                      color:#000;font-weight:900;font-size:11px;letter-spacing:3px;
                      padding:12px 28px;text-decoration:none;">
                      OPEN DASHBOARD
                    </a>
                  </div>

                  <!-- Footer Note -->
                  <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.3);line-height:1.6;">
                    This is an automated system notification from Empire AI.
                    Do not reply to this email directly.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:20px 40px;border-top:1px solid rgba(0,245,255,0.2);">
                  <p style="margin:0;font-size:9px;letter-spacing:2px;color:rgba(0,245,255,0.3);">
                    EMPIRE AI — PREDICTIVE REVENUE &nbsp;&bull;&nbsp;
                    NODE EMP-01 &nbsp;&bull;&nbsp;
                    BUILD v1.0.0
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// ── Validator ─────────────────────────────────────────────────────────────────

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(request) {
  try {
    const { email, name = 'Operator' } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Missing email address' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const fromAddress = process.env.FROM_ADDRESS;
    if (!fromAddress) {
      return NextResponse.json({ error: 'Server misconfiguration: FROM_ADDRESS not set' }, { status: 500 });
    }

    const { data, error } = await resend.emails.send({
      from:    `Empire AI <${fromAddress}>`,
      to:      [email],
      subject: 'Empire AI — Systems Online',
      html:    buildEmailHtml(name),
    });

    if (error) throw error;

    console.log(`Onboarding email sent — id: ${data.id} | to: ${email} | operator: ${name}`);

    return NextResponse.json({
      success:   true,
      message:   'Onboarding email dispatched',
      emailId:   data.id,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Email Route Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
