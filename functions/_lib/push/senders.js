import { SignJWT, importPKCS8 } from "jose";
import { buildApnsPayload, buildFcmMessage } from "./payload.js";

// Secrets (wrangler secret put …). Any missing → that platform is skipped, nothing is sent.
export const APNS_SECRETS = ["APNS_KEY_ID", "APNS_TEAM_ID", "APNS_PRIVATE_KEY", "APNS_BUNDLE_ID"];
export const FCM_SECRETS = ["FCM_SERVICE_ACCOUNT"];

function pem(value) {
  return String(value || "").replace(/\\n/g, "\n").trim();
}

export function pushConfig(env = {}) {
  const has = (name) => typeof env[name] === "string" && env[name].trim().length > 0;
  let fcmAccount = null;
  if (has("FCM_SERVICE_ACCOUNT")) {
    try {
      const parsed = JSON.parse(env.FCM_SERVICE_ACCOUNT);
      if (parsed?.client_email && parsed?.private_key && parsed?.project_id) fcmAccount = parsed;
    } catch {
      fcmAccount = null;
    }
  }
  return {
    apns: APNS_SECRETS.every(has),
    fcm: Boolean(fcmAccount),
    fcmAccount,
    missing: [...APNS_SECRETS, ...FCM_SECRETS].filter((name) => !has(name)),
  };
}

let apnsCache = null; // { jwt, at }
async function apnsJwt(env, now) {
  if (apnsCache && now - apnsCache.at < 50 * 60 * 1000) return apnsCache.jwt;
  const key = await importPKCS8(pem(env.APNS_PRIVATE_KEY), "ES256");
  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: env.APNS_KEY_ID.trim() })
    .setIssuer(env.APNS_TEAM_ID.trim())
    .setIssuedAt(Math.floor(now / 1000))
    .sign(key);
  apnsCache = { jwt, at: now };
  return jwt;
}

let fcmCache = null; // { token, until }
async function fcmAccessToken(account, fetchImpl, now) {
  if (fcmCache && now < fcmCache.until) return fcmCache.token;
  const key = await importPKCS8(pem(account.private_key), "RS256");
  const iat = Math.floor(now / 1000);
  const assertion = await new SignJWT({ scope: "https://www.googleapis.com/auth/firebase.messaging" })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(account.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt(iat)
    .setExpirationTime(iat + 3600)
    .sign(key);
  const response = await fetchImpl("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  if (!response.ok) throw new Error(`FCM auth ${response.status}`);
  const data = await response.json();
  fcmCache = { token: data.access_token, until: now + Math.max(60, (data.expires_in || 3600) - 300) * 1000 };
  return fcmCache.token;
}

export function resetSenderCaches() {
  apnsCache = null;
  fcmCache = null;
}

// Returns { ok, gone } — gone means the token is dead and should be removed.
export async function sendToDevice(env, config, device, feature, { fetchImpl = fetch, now = Date.now() } = {}) {
  try {
    if (device.platform === "ios") {
      if (!config.apns) return { ok: false, skipped: true };
      const jwt = await apnsJwt(env, now);
      const host = device.sandbox ? "api.sandbox.push.apple.com" : "api.push.apple.com";
      const response = await fetchImpl(`https://${host}/3/device/${device.token}`, {
        method: "POST",
        headers: {
          authorization: `bearer ${jwt}`,
          "apns-topic": env.APNS_BUNDLE_ID.trim(),
          "apns-push-type": "alert",
          "apns-priority": "10",
          "apns-collapse-id": String(feature?.properties?.id || "").slice(-64),
          "content-type": "application/json",
        },
        body: JSON.stringify(buildApnsPayload(feature)),
      });
      if (response.ok) return { ok: true };
      let reason = "";
      try {
        reason = (await response.json())?.reason || "";
      } catch {
        /* empty body */
      }
      return { ok: false, gone: response.status === 410 || /BadDeviceToken|Unregistered|DeviceTokenNotForTopic/.test(reason), status: response.status };
    }
    if (device.platform === "android") {
      if (!config.fcm) return { ok: false, skipped: true };
      const access = await fcmAccessToken(config.fcmAccount, fetchImpl, now);
      const response = await fetchImpl(
        `https://fcm.googleapis.com/v1/projects/${config.fcmAccount.project_id}/messages:send`,
        {
          method: "POST",
          headers: { authorization: `Bearer ${access}`, "content-type": "application/json" },
          body: JSON.stringify(buildFcmMessage(device.token, feature)),
        }
      );
      if (response.ok) return { ok: true };
      let text = "";
      try {
        text = await response.text();
      } catch {
        /* empty body */
      }
      return { ok: false, gone: response.status === 404 || /UNREGISTERED|INVALID_ARGUMENT.*token/i.test(text), status: response.status };
    }
  } catch {
    return { ok: false, error: true };
  }
  return { ok: false, skipped: true };
}
