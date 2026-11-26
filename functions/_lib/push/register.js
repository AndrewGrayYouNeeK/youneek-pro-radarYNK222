import { coarseCell, zoneCode } from "./coarse.js";
import { removeDevice, saveDevice, validToken } from "./store.js";

const NWS_HEADERS = { Accept: "application/geo+json", "User-Agent": "YouNeeKProRadar/1.0 (push zones; andrewgray@youneek.xyz)" };

// NWS forecast zone + county + fire zone for a coarse cell. Best effort.
export async function zonesForCell(cell, fetchImpl = fetch) {
  try {
    const response = await fetchImpl(`https://api.weather.gov/points/${cell.lat.toFixed(1)},${cell.lon.toFixed(1)}`, { headers: NWS_HEADERS });
    if (!response.ok) return [];
    const p = (await response.json())?.properties || {};
    return [p.forecastZone, p.county, p.fireWeatherZone].map(zoneCode).filter(Boolean);
  } catch {
    return [];
  }
}

function json(body, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function handlePushRegister(request, env = {}, { fetchImpl = fetch } = {}) {
  if (!env.PUSH_KV) return json({ ok: false, enabled: false, reason: "push-not-configured" }, 503);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, reason: "bad-json" }, 400);
  }
  const platform = body?.platform;
  const token = String(body?.token || "");
  if (!validToken(platform, token)) return json({ ok: false, reason: "bad-token" }, 400);
  // Re-round on the server so precise coordinates are never stored even if sent.
  const cell = coarseCell(body?.lat, body?.lon);
  if (!cell) return json({ ok: false, reason: "bad-location" }, 400);
  const zones = await zonesForCell(cell, fetchImpl);
  await saveDevice(env.PUSH_KV, { platform, token, zones, cell, sandbox: body?.sandbox === true });
  return json({ ok: true, zones, cell });
}

export async function handlePushUnregister(request, env = {}) {
  if (!env.PUSH_KV) return json({ ok: true });
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, reason: "bad-json" }, 400);
  }
  if (!body?.token) return json({ ok: false, reason: "bad-token" }, 400);
  await removeDevice(env.PUSH_KV, String(body.token));
  return json({ ok: true });
}
