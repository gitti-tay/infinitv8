import crypto from "crypto";

const SUMSUB_APP_TOKEN = process.env.SUMSUB_APP_TOKEN || "";
const SUMSUB_SECRET_KEY = process.env.SUMSUB_SECRET_KEY || "";
const SUMSUB_BASE_URL = "https://api.sumsub.com";

function createSignature(ts: number, method: string, url: string, body?: string) {
  const hmac = crypto.createHmac("sha256", SUMSUB_SECRET_KEY);
  hmac.update(ts + method.toUpperCase() + url);
  if (body) hmac.update(body);
  return hmac.digest("hex");
}

export async function createApplicant(externalUserId: string, email: string) {
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

  return res.json();
}

export async function getAccessToken(externalUserId: string) {
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

  return res.json();
}
