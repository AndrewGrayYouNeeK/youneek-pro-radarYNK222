// Device registry in Workers KV. One key per device; everything the cron needs is
// in the key's metadata (token, platform, NWS zones, coarse cell), so the cron can
// list devices without extra reads. Keys expire on their own (TTL), and there are
// no accounts, names, or precise locations.

export const DEVICE_PREFIX = "dev:";
export const DEVICE_TTL_SECONDS = 30 * 24 * 60 * 60;
export const SENT_KEY = "sent-alerts";
export const SENT_TTL_SECONDS = 2 * 24 * 60 * 60;
const MAX_SENT_IDS = 500;

export async function hashToken(token) {
  const bytes = new TextEncoder().encode(String(token));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function validToken(platform, token) {
  const value = String(token || "");
  if (platform === "ios") return /^[0-9a-fA-F]{64,200}$/.test(value);
  // KV metadata is capped at 1024 bytes; FCM tokens are ~160 characters.
  if (platform === "android") return /^[A-Za-z0-9_:\-.]{100,600}$/.test(value);
  return false;
}

export async function saveDevice(kv, { platform, token, zones = [], cell = null, sandbox = false }) {
  const key = DEVICE_PREFIX + (await hashToken(token));
  const metadata = {
    p: platform,
    t: token,
    z: [...new Set(zones)].slice(0, 6),
    c: cell ? [cell.lat, cell.lon] : null,
    s: sandbox ? 1 : 0,
  };
  await kv.put(key, "1", { expirationTtl: DEVICE_TTL_SECONDS, metadata });
  return key;
}

export async function removeDevice(kv, token) {
  await kv.delete(DEVICE_PREFIX + (await hashToken(token)));
}

export async function listDevices(kv) {
  const devices = [];
  let cursor;
  do {
    const page = await kv.list({ prefix: DEVICE_PREFIX, cursor });
    for (const key of page.keys || []) {
      const m = key.metadata;
      if (!m?.t || !m?.p) continue;
      devices.push({
        key: key.name,
        platform: m.p,
        token: m.t,
        zones: Array.isArray(m.z) ? m.z : [],
        cell: Array.isArray(m.c) ? { lat: m.c[0], lon: m.c[1] } : null,
        sandbox: m.s === 1,
      });
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return devices;
}

export async function readSentIds(kv) {
  try {
    const raw = await kv.get(SENT_KEY);
    const list = JSON.parse(raw || "[]");
    return new Set(Array.isArray(list) ? list : []);
  } catch {
    return new Set();
  }
}

export async function writeSentIds(kv, ids) {
  const list = [...ids].slice(-MAX_SENT_IDS);
  await kv.put(SENT_KEY, JSON.stringify(list), { expirationTtl: SENT_TTL_SECONDS });
}

// Alerts whose sends did not all fit in one cron run: alertId -> device keys already sent.
export const PROGRESS_KEY = "push-progress";

export async function readProgress(kv) {
  try {
    const raw = await kv.get(PROGRESS_KEY);
    const value = raw ? JSON.parse(raw) : {};
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

export async function writeProgress(kv, progress) {
  if (!Object.keys(progress).length) {
    await kv.delete(PROGRESS_KEY);
    return;
  }
  await kv.put(PROGRESS_KEY, JSON.stringify(progress), { expirationTtl: SENT_TTL_SECONDS });
}
