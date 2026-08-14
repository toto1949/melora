const isProductionBuild =
  process.env.VERCEL_ENV === "production" ||
  process.env.ENFORCE_PRODUCTION_ENV === "true";

if (!isProductionBuild) {
  console.log("Production environment verification skipped outside a production deployment.");
  process.exit(0);
}

const present = (name, minLength = 1) => {
  const value = process.env[name]?.trim() ?? "";
  return value.length >= minLength && !/^(replace|changeme|todo|mock|undefined|null)/i.test(value);
};

const missing = [];
const requireValue = (name, minLength = 1) => {
  if (!present(name, minLength)) missing.push(name);
};
const requireHttpsUrl = (name) => {
  try {
    const url = new URL(process.env[name] ?? "");
    if (url.protocol !== "https:") missing.push(`${name}=https://...`);
  } catch {
    missing.push(`${name}=valid HTTPS URL`);
  }
};

if (process.env.USE_MOCK_PROVIDERS !== "false") {
  missing.push("USE_MOCK_PROVIDERS=false");
}
if (!["true", "false"].includes(process.env.VIDEO_FEATURE_ENABLED ?? "")) {
  missing.push("VIDEO_FEATURE_ENABLED=false|true");
}

[
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "OPENAI_API_KEY",
  "JOB_WORKER_SECRET",
  "CRON_SECRET",
  "LISTEN_TOKEN_SECRET",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
].forEach((name) => requireValue(name));

if (process.env.LYRICS_PROVIDER !== "openai") missing.push("LYRICS_PROVIDER=openai");

if (process.env.MUSIC_PROVIDER === "kunavo") {
  requireValue("MUSIC_PROVIDER_API_KEY");
} else if (process.env.MUSIC_PROVIDER === "http") {
  requireValue("MUSIC_PROVIDER_URL");
  requireValue("MUSIC_PROVIDER_API_KEY");
} else {
  missing.push("MUSIC_PROVIDER=kunavo|http");
}

if (process.env.COVER_PROVIDER === "http") {
  requireValue("COVER_PROVIDER_URL");
  requireValue("COVER_PROVIDER_API_KEY");
}
else if (!["music", "builtin"].includes(process.env.COVER_PROVIDER ?? "")) {
  missing.push("COVER_PROVIDER=music|builtin|http");
}

if (process.env.MALWARE_SCAN_REQUIRED !== "true") {
  missing.push("MALWARE_SCAN_REQUIRED=true");
}
if ((process.env.MALWARE_SCANNER_URL ?? "").trim().toLowerCase() === "builtin") {
  // Signature checks in process-upload.ts are enough for the audio-only image uploads.
} else {
  requireValue("MALWARE_SCANNER_URL");
  requireValue("MALWARE_SCANNER_API_KEY");
}

for (const secret of ["JOB_WORKER_SECRET", "CRON_SECRET", "LISTEN_TOKEN_SECRET"]) {
  if (!present(secret, 24)) missing.push(`${secret} (24+ characters)`);
}
const internalSecrets = [
  process.env.JOB_WORKER_SECRET,
  process.env.CRON_SECRET,
  process.env.LISTEN_TOKEN_SECRET,
].filter(Boolean);
if (new Set(internalSecrets).size !== internalSecrets.length) {
  missing.push("JOB_WORKER_SECRET, CRON_SECRET, and LISTEN_TOKEN_SECRET must be distinct");
}

if (process.env.VIDEO_FEATURE_ENABLED === "true") {
  if (process.env.VIDEO_PROVIDER !== "http") missing.push("VIDEO_PROVIDER=http");
  requireValue("VIDEO_PROVIDER_URL");
  requireValue("VIDEO_PROVIDER_API_KEY");
}

try {
  const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL ?? "");
  if (appUrl.protocol !== "https:") missing.push("NEXT_PUBLIC_APP_URL=https://...");
} catch {
  missing.push("NEXT_PUBLIC_APP_URL=valid URL");
}

for (const name of ["NEXT_PUBLIC_SUPABASE_URL", "UPSTASH_REDIS_REST_URL"]) {
  requireHttpsUrl(name);
}
if ((process.env.MALWARE_SCANNER_URL ?? "").trim().toLowerCase() !== "builtin") {
  requireHttpsUrl("MALWARE_SCANNER_URL");
}
for (const name of ["MUSIC_PROVIDER_URL", "COVER_PROVIDER_URL", "VIDEO_PROVIDER_URL"]) {
  if (present(name)) requireHttpsUrl(name);
}

const stripeSecretMode = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_")
  ? "live"
  : process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")
    ? "test"
    : null;
const stripePublicMode = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith("pk_live_")
  ? "live"
  : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith("pk_test_")
    ? "test"
    : null;
if (!stripeSecretMode || stripeSecretMode !== stripePublicMode) {
  missing.push("matching Stripe secret/publishable key modes");
}
if (!process.env.STRIPE_WEBHOOK_SECRET?.startsWith("whsec_")) {
  missing.push("STRIPE_WEBHOOK_SECRET=whsec_...");
}

if (missing.length) {
  console.error(`Production deployment blocked. Missing or invalid: ${[...new Set(missing)].join(", ")}`);
  process.exit(1);
}

console.log("Production environment verification passed.");
