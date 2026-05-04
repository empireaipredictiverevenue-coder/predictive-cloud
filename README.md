# Empire AI Email Service — Quick Start

This repository hosts the onboarding email flow and a Hermes/Predicative dashboard prototype. The UI uses inline CSS for speed and a low file count. Endpoints are wired to Resend for email delivery.

What you get
- app/api/email/route.js: onboarding email sender (FROM_ADDRESS enforced via env)
- app/api/send/route.js: minimal POST endpoint to trigger onboarding email with neon/cyan steel framing
- app/page.js (and app/page.jsx migrations): a lightweight client UI with an Empire A.I. branding surface

Prerequisites
- Node.js and npm (or pnpm/yarn)
- A GitHub repository (for remote push) if you want to publish the code
- A Resend API key and a verified FROM_ADDRESS on your domain
- A local environment file if you run locally: .env.local with the required keys

Environment variables (local development)
- RESEND_API_KEY: your Resend API key
- FROM_ADDRESS: the sending address (e.g. noreply@yourdomain.com)
- FROM_NAME: display name for From header (optional; defaults to Empire AI)

Endpoints
- POST /api/send
  - Payload: { email }
  - Triggers onboarding email (uses ONBOARDING template)
- POST /api/email
  - Payload: { email, name }
  - Sends onboarding email using the vault-styled HTML template

Quick start (local)
- Install: npm install
- Run: npm run dev
- Open: http://localhost:3000
- Test onboarding email:
  - PowerShell (Windows):
    # ensure environment variables are set in your shell
    $env:RESEND_API_KEY = "<your-resend-key>"
    $env:FROM_ADDRESS = "noreply@yourdomain.com"
    $env:FROM_NAME = "Empire AI"
    # Or use a .env.local file in Next.js projects
- Test API via curl:
  curl -X POST http://localhost:3000/api/send \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}'

Notes
- This repository favors inline CSS in components to minimize dependencies and maximize speed.
- If you want Tailwind removed entirely, I can convert affected components to plain inline styles in a follow-up.
- The README intentionally keeps instructions concise; if you need deeper guidance, I can extend it on request.
