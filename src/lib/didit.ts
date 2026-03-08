const DIDIT_API_KEY = process.env.DIDIT_API_KEY;
const DIDIT_WORKFLOW_ID = process.env.DIDIT_WORKFLOW_ID;
const DIDIT_BASE_URL = "https://verification.didit.me";

if (!DIDIT_API_KEY || !DIDIT_WORKFLOW_ID) {
  console.warn("DIDIT_API_KEY or DIDIT_WORKFLOW_ID is not set. KYC features will not work.");
}

export async function createSession(userId: string, callbackUrl: string) {
  if (!DIDIT_API_KEY || !DIDIT_WORKFLOW_ID) {
    throw new Error("Didit credentials are not configured");
  }

  const res = await fetch(`${DIDIT_BASE_URL}/v3/session/`, {
    method: "POST",
    headers: {
      "x-api-key": DIDIT_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      workflow_id: DIDIT_WORKFLOW_ID,
      callback: callbackUrl,
      vendor_data: userId,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Didit createSession failed (${res.status}): ${errorBody}`);
  }

  return res.json();
}

export async function getSessionDecision(sessionId: string) {
  if (!DIDIT_API_KEY) {
    throw new Error("Didit credentials are not configured");
  }

  const res = await fetch(`${DIDIT_BASE_URL}/v3/session/${sessionId}/decision/`, {
    headers: { "x-api-key": DIDIT_API_KEY },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Didit getSessionDecision failed (${res.status}): ${errorBody}`);
  }

  return res.json();
}
