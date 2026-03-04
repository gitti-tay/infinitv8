import crypto from "crypto";

const SUMSUB_APP_TOKEN = process.env.SUMSUB_APP_TOKEN;
const SUMSUB_SECRET_KEY = process.env.SUMSUB_SECRET_KEY;
const SUMSUB_BASE_URL = "https://api.sumsub.com";

if (!SUMSUB_APP_TOKEN || !SUMSUB_SECRET_KEY) {
  console.warn(
    "SUMSUB_APP_TOKEN or SUMSUB_SECRET_KEY is not set. KYC features will not work."
  );
}

function createSignature(ts: number, method: string, url: string, body?: string) {
  const hmac = crypto.createHmac("sha256", SUMSUB_SECRET_KEY || "");
  hmac.update(ts + method.toUpperCase() + url);
  if (body) hmac.update(body);
  return hmac.digest("hex");
}

export async function createApplicant(externalUserId: string, email: string) {
  if (!SUMSUB_APP_TOKEN || !SUMSUB_SECRET_KEY) {
    throw new Error("Sumsub credentials are not configured");
  }

  const ts = Math.floor(Date.now() / 1000);
  const path = "/resources/applicants?levelName=basic-kyc-level";
  const body = JSON.stringify({ externalUserId, email });
  const signature = createSignature(ts, "POST", path, body);

  const res = await fetch(`${SUMSUB_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-App-Token": SUMSUB_APP_TOKEN,
      "X-App-Access-Ts": String(ts),
      "X-App-Access-Sig": signature,
    },
    body,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Sumsub createApplicant failed (${res.status}): ${errorBody}`);
  }

  return res.json();
}

export async function getAccessToken(externalUserId: string) {
  if (!SUMSUB_APP_TOKEN || !SUMSUB_SECRET_KEY) {
    throw new Error("Sumsub credentials are not configured");
  }

  const ts = Math.floor(Date.now() / 1000);
  const path = `/resources/accessTokens?userId=${externalUserId}&levelName=basic-kyc-level`;
  const signature = createSignature(ts, "POST", path);

  const res = await fetch(`${SUMSUB_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "X-App-Token": SUMSUB_APP_TOKEN,
      "X-App-Access-Ts": String(ts),
      "X-App-Access-Sig": signature,
    },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Sumsub getAccessToken failed (${res.status}): ${errorBody}`);
  }

  const data = await res.json();
  if (!data.token) {
    throw new Error("Sumsub returned empty access token");
  }

  return data;
}
