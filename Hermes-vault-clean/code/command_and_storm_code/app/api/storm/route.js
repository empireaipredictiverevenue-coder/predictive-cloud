import { NextResponse } from 'next/server';
// Mock mode toggle (true to bypass external services for local/dev testing)
// Real operation requires keys to be present (RUNWAY_API_KEY, GOOGLE_API_KEY, RESEND_API_KEY)
const MOCK_DEV = (process.env.DEV_MOCK === 'true');
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// === Config ===

const RUNWAY_POLL_INTERVAL_MS = 5_000;
const RUNWAY_MAX_ATTEMPTS     = 24;
const SATELLITE_ZOOM          = 18;
const SATELLITE_SIZE          = '600x600';

// === Helpers ===

function buildSatelliteUrl(zip) {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) throw new Error('Missing env: GOOGLE_API_KEY');

  const params = new URLSearchParams({
    center:  zip,
    zoom:    String(SATELLITE_ZOOM),
    size:    SATELLITE_SIZE,
    maptype: 'satellite',
    key,
  });

  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
}

async function submitRunwayTask(satelliteImageUrl) {
  const key = process.env.RUNWAY_API_KEY;
  if (!key) throw new Error('Missing env: RUNWAY_API_KEY');

  const res = await fetch('https://api.runwayml.com/v1/image_to_video', {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      promptImage: satelliteImageUrl,
      promptText:  'Cinematic drone shot, heavy storm damage to roof, high wind, hyper-realistic.',
      seed:        42,
      watermark:   false,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Runway submission failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const taskId = data?.task?.id ?? data?.id;
  if (!taskId) throw new Error('Runway did not return a task ID.');

  return taskId;
}

async function pollRunwayTask(taskId) {
  const key = process.env.RUNWAY_API_KEY;

  for (let attempt = 1; attempt <= RUNWAY_MAX_ATTEMPTS; attempt++) {
    await new Promise((r) => setTimeout(r, RUNWAY_POLL_INTERVAL_MS));

    const res = await fetch(`https://api.runwayml.com/v1/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${key}` },
    });

    if (!res.ok) throw new Error(`Runway poll failed (${res.status})`);

    const data = await res.json();
    const status = data?.task?.status ?? data?.status;

    console.log(`[Storm] Task ${taskId} - attempt ${attempt}/${RUNWAY_MAX_ATTEMPTS} - status: ${status}`);

    if (status === 'SUCCEEDED') {
      const url = data?.task?.output?.[0] ?? data?.output?.[0];
      if (!url) throw new Error('Runway task succeeded but output URL is missing.');
      return url;
    }

    if (status === 'FAILED') {
      throw new Error(`Runway task ${taskId} failed.`);
    }
  }

  throw new Error(`Runway task ${taskId} timed out after ${RUNWAY_MAX_ATTEMPTS} attempts.`);
}

async function deliverEmail(email, videoUrl, imageUrl) {
  if (!process.env.RESEND_API_KEY) throw new Error('Missing env: RESEND_API_KEY');

  // TODO: replace with your Resend-verified domain before going live
  const FROM_ADDRESS = process.env.FROM_EMAIL ?? 'Empire AI <storm@your-domain.com>';

  const { data, error } = await resend.emails.send({
    from:    FROM_ADDRESS,
    to:      [email],
    subject: 'URGENT: Your Cinematic Storm Damage Report',
    html: `
      <div style="background-color:#000000;color:#ffffff;padding:40px;font-family:monospace;text-align:center;max-width:600px;margin:0 auto;">
        <p style="color:#39ff14;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:4px;margin-bottom:8px;">
          EMPIRE AI &middot; PREDICTIVE REVENUE
        </p>
        <h1 style="color:#00ffff;font-size:28px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">
          TARGET ZONE SCANNED
        </h1>
        <p style="color:#aaaaaa;font-size:15px;line-height:1.6;margin-bottom:30px;">
          We have processed the satellite data for your requested area and rendered a cinematic damage assessment.
        </p>

        <img
          src="${imageUrl}"
          alt="Satellite view of target zone"
          style="max-width:100%;border:2px solid #39ff14;border-radius:8px;margin-bottom:30px;box-shadow:0 0 20px rgba(57,255,20,0.3 );"
        />

        <a
          href="${videoUrl}"
          style="display:inline-block;background-color:#39ff14;color:#000000;padding:16px 36px;text-decoration:none;font-weight:900;font-size:16px;text-transform:uppercase;border-radius:8px;letter-spacing:2px;font-family:monospace;"
        >
          WATCH CINEMATIC DAMAGE VIDEO &rarr;
        </a>

        <hr style="border:none;border-top:1px solid #222;margin:40px 0 20px;" />

        <p style="color:#333333;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-family:monospace;">
          POWERED BY EMPIRE AI PREDICTIVE CLOUD
        </p>
      </div>
    `,
  });

  if (error) throw new Error(`Resend delivery failed: ${error.message}`);

  return data;
}

// === Route Handler ===

export async function POST(req) {
  try {
    const body = await req.json();
    const { zip, email } = body;

    if (!zip || !/^[0-9]{5}$/.test(zip.trim())) {
      return NextResponse.json(
        { success: false, error: 'A valid 5-digit ZIP code is required.' },
        { status: 400 }
      );
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    console.log(`[Storm] Target locked - ZIP: ${zip} | Email: ${email}`);

  // Mock mode OR missing keys: short-circuit to avoid external calls when keys are not present
  if (MOCK_DEV || !process.env.GOOGLE_API_KEY || !process.env.RUNWAY_API_KEY || !process.env.RESEND_API_KEY) {
      const fakeImage = `https://picsum.photos/seed/${zip.trim()}/600/600`;
      const fakeVideo = 'https://www.w3schools.com/html/mov_bbb.mp4';
    // If keys are missing but we are not in mock mode, still respond with an error so caller knows
    if (!MOCK_DEV && (!process.env.GOOGLE_API_KEY || !process.env.RUNWAY_API_KEY || !process.env.RESEND_API_KEY)) {
      return NextResponse.json({ success: false, error: 'Missing required Runway/Google/Resend keys' }, { status: 500 });
    }
    console.log('[Storm][MOCK] Running in mock mode. ZIP:', zip, 'EMAIL:', email);
      return NextResponse.json({ success: true, message: 'Mock Runway pipeline complete', image: fakeImage, video: fakeVideo });
    }

    const satelliteImageUrl = buildSatelliteUrl(zip.trim());
    console.log('[Storm] Satellite image URL built.');

    const taskId = await submitRunwayTask(satelliteImageUrl);
    console.log(`[Storm] Runway task created: ${taskId}`);

    const cinematicVideoUrl = await pollRunwayTask(taskId);
    console.log(`[Storm] Video render complete: ${cinematicVideoUrl}`);

    await deliverEmail(email, cinematicVideoUrl, satelliteImageUrl);
    console.log(`[Storm] Email dispatched to ${email}.`);

    return NextResponse.json({
      success: true,
      message: 'Cinematic video rendered and delivered to inbox.',
    });

  } catch (error) {
    console.error('[Storm] Pipeline failed:', error?.message ?? error);
    return NextResponse.json(
      { success: false, error: 'Failed to process target area.' },
      { status: 500 }
    );
  }
}
