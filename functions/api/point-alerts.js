import { isWeatherEmergency } from "../../src/lib/safety/weatherEmergency.js";

const NWS_HEADERS = {
  Accept: "application/geo+json",
  "User-Agent": "YouNeeKProRadar/1.0 (point-alerts)",
};

export const RECENT_ALERT_MS = 12 * 60 * 60 * 1000;

export function mapNwsFeature(feature) {
  const properties = feature.properties || {};
  return {
    id: feature.id || properties.id,
    name: properties.event || properties.headline || "Weather alert",
    description: properties.headline || properties.description || "",
    source: "NWS",
    severity: properties.severity || "",
    urgency: properties.urgency || "",
    certainty: properties.certainty || "",
    issued: properties.sent || properties.effective,
    expires: properties.ends || properties.expires,
    url: properties.web,
  };
}

function isRecentlyEnded(alert, now = Date.now()) {
  const expires = Date.parse(alert.expires || "");
  if (!Number.isFinite(expires)) return false;
  return expires < now && now - expires <= RECENT_ALERT_MS;
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: NWS_HEADERS });
  if (!response.ok) {
    throw new Error(`NWS alerts failed (${response.status})`);
  }
  return response.json();
}

export async function fetchPointAlerts(lat, lon, now = Date.now()) {
  const point = `${lat},${lon}`;
  const [activePayload, recentPayload] = await Promise.all([
    fetchJson(`https://api.weather.gov/alerts/active?point=${point}`).catch(() => ({ features: [] })),
    fetchJson(`https://api.weather.gov/alerts?point=${point}&status=actual`).catch(() => ({ features: [] })),
  ]);

  const seen = new Set();
  const alerts = [];

  const push = (feature, extra = {}) => {
    const alert = { ...mapNwsFeature(feature), ...extra };
    const key = alert.id || `${alert.name}-${alert.issued}`;
    if (seen.has(key)) return;
    seen.add(key);
    alerts.push(alert);
  };

  for (const feature of activePayload.features || []) {
    push(feature);
  }
  for (const feature of recentPayload.features || []) {
    const alert = mapNwsFeature(feature);
    if (isWeatherEmergency(alert) && isRecentlyEnded(alert, now)) {
      push(feature, { recent: true });
    }
  }

  return alerts;
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const lat = url.searchParams.get("lat");
  const lon = url.searchParams.get("lon");

  if (!lat || !lon) {
    return Response.json({ error: "lat and lon are required" }, { status: 400 });
  }

  try {
    const alerts = await fetchPointAlerts(lat, lon);
    return Response.json(
      { alerts },
      { headers: { "Cache-Control": "public, max-age=120" } }
    );
  } catch (error) {
    return Response.json({ alerts: [], error: error.message }, { status: 502 });
  }
}
