#!/usr/bin/env node
// Load secrets from AWS Secrets Manager (or other supported secret stores)
// This runs before the Next.js dev server starts (via predev in package.json)
try {
  const ARN = process.env.HERMES_SECRETS_ARN || process.env.SECRETS_ARN || '';
  if (!ARN) {
    console.log('[Secrets] No secret ARN provided. Skipping secrets load.');
    process.exit(0);
  }
  // Lazy import to avoid pulling the AWS SDK when not needed
  const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
  const region = process.env.AWS_REGION || process.env.REGION || 'us-east-1';
  const client = new SecretsManagerClient({ region });
  (async () => {
    try {
      const cmd = new GetSecretValueCommand({ SecretId: ARN });
      const data = await client.send(cmd);
      const secretString = data.SecretString || (data.SecretBinary ? Buffer.from(data.SecretBinary, 'base64').toString() : '');
      if (!secretString) {
        console.warn('[Secrets] Secret value is empty.');
        return;
      }
      const parsed = JSON.parse(secretString);
      Object.keys(parsed).forEach((k) => {
        if (typeof parsed[k] === 'string') {
          process.env[k] = parsed[k];
        } else {
          process.env[k] = JSON.stringify(parsed[k]);
        }
      });
      console.log('[Secrets] Loaded secrets from AWS Secrets Manager into process.env');
    } catch (err) {
      console.error('[Secrets] Failed to load secrets:', err?.message ?? err);
      // Do not crash the process; secrets may be provided via env or mocked in dev
    }
  })();

  // Local secrets fallback (secrets.local.json) as a developer-friendly option when a secrets manager isn't available
  try {
    const fs = require('fs');
    const path = require('path');
    const localPath = path.resolve(process.cwd(), 'secrets.local.json');
    if (fs.existsSync(localPath)) {
      const raw = fs.readFileSync(localPath, 'utf8');
      const json = JSON.parse(raw);
      Object.entries(json).forEach(([k, v]) => {
        process.env[k] = typeof v === 'string' ? v : JSON.stringify(v);
      });
      console.log('[Secrets] Loaded local secrets from secrets.local.json into process.env');
    } else {
      // Also support a JSON file at repo root for quick local dev
      const altPath = path.resolve(process.cwd(), 'secrets.json');
      if (fs.existsSync(altPath)) {
        const rawAlt = fs.readFileSync(altPath, 'utf8');
        const jsonAlt = JSON.parse(rawAlt);
        Object.entries(jsonAlt).forEach(([k, v]) => {
          process.env[k] = typeof v === 'string' ? v : JSON.stringify(v);
        });
        console.log('[Secrets] Loaded local secrets from secrets.json into process.env');
      }
    }
  } catch (e) {
    // ignore local secrets load errors to avoid blocking startup
  }

  // Hetzner Secrets (optional): if HETZNER_SECRETS_ID and HETZNER_API_TOKEN provided,
  // attempt to load secrets from Hetzner Cloud Secrets API.
  const hetznerSecretId = process.env.HETZNER_SECRETS_ID || process.env.HETZNER_SECRET_ID;
  const hetznerToken = process.env.HETZNER_API_TOKEN;
  if (hetznerSecretId && hetznerToken) {
    (async () => {
      try {
        const res = await fetch(`https://api.hetzner.cloud/v1/secrets/${hetznerSecretId}`, {
          headers: { Authorization: `Bearer ${hetznerToken}` },
        });
        if (!res.ok) {
          console.warn('[Secrets] Hetzner secret fetch failed:', res.status, res.statusText);
          return;
        }
        const data = await res.json();
        // Hetzner secret payloads could be in data.value or data.secret or data.data
        const payload = data?.value ?? data?.secret ?? data?.secret_value ?? data?.data;
        if (!payload) {
          console.warn('[Secrets] Hetzner secret payload empty');
          return;
        }
        let parsed = payload;
        if (typeof payload === 'string') {
          try { parsed = JSON.parse(payload); } catch { parsed = payload; }
        }
        if (typeof parsed === 'object') {
          Object.entries(parsed).forEach(([k, v]) => {
            process.env[k] = String(v);
          });
          console.log('[Secrets] Hetzner secret loaded into process.env');
        } else {
          console.warn('[Secrets] Hetzner secret payload not an object; skipping env injection');
        }
      } catch (err) {
        console.error('[Secrets] Hetzner load error:', err?.message ?? err);
      }
    })();
  }
})();
catch (err) {
  console.error('[Secrets] Unexpected error:', err);
  process.exit(0);
}
