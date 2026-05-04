/**
 * agents/beta_analyst.js
 * Empire AI — Agent Beta: The Threshold & 2FA Gatekeeper
 *
 * Two responsibilities:
 *  1. LEAD THRESHOLD FILTER
 *     Receives raw leads from Agent Alpha, applies configurable scoring
 *     thresholds, and emits only qualified leads for downstream action.
 *  2. DEAL AUTHORISATION 2FA
 *     When a deal is submitted for authorization, Beta generates a TOTP
 *     code and sends it via Vonage SMS. The operator must confirm with
 *     that code before the Pod deployment is triggered.
 *
 * Usage (standalone):
 *   node agents/beta_analyst.js filter  <leads.json>
 *   node agents/beta_analyst.js 2fa     <msisdn> <dealId>
 */

require("dotenv").config();
const { authenticator } = require("otplib");
const { Vonage }        = require("@vonage/server-sdk");
const fs                = require("fs");

// ── Config ───────────────────────────────────────────────────────────────────
const THRESHOLD  = parseInt(process.env.LEAD_SCORE_THRESHOLD || "50", 10);
const TOTP_TTL   = parseInt(process.env.TOTP_STEP_SECONDS    || "300", 10); // 5 min

// In-memory pending authorisations: dealId → { secret, expiresAt, msisdn }
const pendingAuth = new Map();

authenticator.options = { step: TOTP_TTL };

const vonage = new Vonage({
  apiKey:    process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
});

// ── 1. Lead threshold filter ─────────────────────────────────────────────────-
/**
 * Filter an array of raw leads, returning only those that meet the threshold.
 * Also annotates each lead with a tier label.
 *
 * @param {object[]} leads
 * @param {number}   [threshold]
 * @returns {{ qualified: object[], rejected: object[], stats: object }}
 */
function filterLeads(leads, threshold = THRESHOLD) {
  const tiers = { hot: 150, warm: 80, cool: threshold };

  function tier(score) {
    if (score >= tiers.hot)  return "🔥 HOT";
    if (score >= tiers.warm) return "🟡 WARM";
    if (score >= tiers.cool) return "🔵 COOL";
    return null;
  }

  const qualified = [];
  const rejected  = [];

  for (const lead of leads) {
    const t = tier(lead.lead_score || 0);
    if (t) {
      qualified.push({ ...lead, tier: t });
    } else {
      rejected.push(lead);
    }
  }

  const stats = {
    total:     leads.length,
    qualified: qualified.length,
    rejected:  rejected.length,
    threshold,
    tiers: {
      hot:  qualified.filter(l => l.tier.includes("HOT")).length,
      warm: qualified.filter(l => l.tier.includes("WARM")).length,
      cool: qualified.filter(l => l.tier.includes("COOL")).length,
    },
  };

  return { qualified, rejected, stats };
}

// ── 2FA — generate and send TOTP ───────────────────────────────────────────
/**
 * Generate a TOTP secret for a deal, store it, send the code via SMS.
 *
 * @param {string} dealId
 * @param {string} msisdn  E.164 number of the authorising commander
 * @returns {Promise<{ secret: string, expiresAt: string }>}
 */
async function initiate2FA(dealId, msisdn) {
  const secret     = authenticator.generateSecret();
  const token      = authenticator.generate(secret);
  const expiresAt  = new Date(Date.now() + TOTP_TTL * 1000).toISOString();

  pendingAuth.set(dealId, { secret, expiresAt, msisdn });

  const msg =
    `🔐 EMPIRE AI — Deal Auth\n` +
    `Deal: ${dealId}\n` +
    `Code: ${token}\n` +
    `Expires: ${TOTP_TTL / 60} min\n` +
    `Reply: EMPIRE AI CONFIRM ${dealId} ${token}`;

  await vonage.sms.send({
    to:   msisdn,
    from: process.env.VONAGE_NUMBER,
    text: msg,
  });

  console.log(`[Beta] 2FA initiated for deal ${dealId} → ${msisdn} (expires ${expiresAt})`);
  return { secret, expiresAt };
}

/**
 * Verify a submitted TOTP token for a pending deal.
 *
 * @param {string} dealId
 * @param {string} submittedToken
 * @returns {{ valid: boolean, reason?: string }}
 */
function verify2FA(dealId, submittedToken) {
  const pending = pendingAuth.get(dealId);
  if (!pending)                              return { valid: false, reason: "No pending auth for this deal" };
  if (new Date() > new Date(pending.expiresAt)) {
    pendingAuth.delete(dealId);
    return { valid: false, reason: "2FA token expired" };
  }

  const ok = authenticator.check(submittedToken, pending.secret);
  if (ok) pendingAuth.delete(dealId);
  return ok
    ? { valid: true }
    : { valid: false, reason: "Invalid token" };
}

// ── CLI runner ───────────────────────────────────────────────────────────────
if (require.main === module) {
  const [,, mode, ...args] = process.argv;

  if (mode === "filter") {
    const file  = args[0];
    if (!file) { console.error("Usage: beta_analyst.js filter <leads.json>"); process.exit(1); }
    const leads = JSON.parse(fs.readFileSync(file, "utf-8"));
    const result = filterLeads(Array.isArray(leads) ? leads : leads.leads || []);
    console.log(JSON.stringify(result, null, 2));

  } else if (mode === "2fa") {
    const [msisdn, dealId] = args;
    if (!msisdn || !dealId) {
      console.error("Usage: beta_analyst.js 2fa <msisdn> <dealId>"); process.exit(1);
    }
    initiate2FA(dealId, msisdn)
      .then(r => console.log("2FA sent:", r))
      .catch(e => { console.error(e); process.exit(1); });

  } else {
    console.log("Modes: filter | 2fa");
  }
}

module.exports = { filterLeads, initiate2FA, verify2FA };
