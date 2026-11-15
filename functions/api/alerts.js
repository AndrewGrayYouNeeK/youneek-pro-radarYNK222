const NWS_HEADERS = {
  Accept: "application/geo+json",
  "User-Agent": "YouNeeKProRadar/1.0 (alerts)",
};

const ALERT_EVENTS = {
  tornado: ["Tornado Warning"],
  tornado_watch: ["Tornado Watch"],
  severe_watch: ["Severe Thunderstorm Watch"],
  // "severe" matches the client's layer key and toggle (RadarDisplay paints ynkLayer === "severe").
  severe: ["Severe Thunderstorm Warning"],
  flood: ["Flood Warning", "Flash Flood Warning", "Flood Watch", "Flash Flood Watch"],
  winter: [
    "Winter Storm Warning",
    "Blizzard Warning",
    "Ice Storm Warning",
    "Winter Weather Advisory",
    "Blizzard Watch",
    "Winter Storm Watch",
  ],
  heat: ["Heat Advisory", "Excessive Heat Warning", "Excessive Heat Watch"],
  wind: ["High Wind Warning", "High Wind Watch", "Wind Advisory"],
  fire: ["Red Flag Warning", "Fire Weather Watch"],
  fog: ["Dense Fog Advisory"],
};

// Older clients asked for ?type=thunderstorm.
const TYPE_ALIASES = { thunderstorm: "severe" };

const EVENT_LAYER = Object.fromEntries(
  Object.entries(ALERT_EVENTS).flatMap(([layer, events]) => events.map((event) => [event, layer]))
);

// ---- Zone geometry for alerts NWS sends with geometry: null (winter, wind, fog, many advisories) ----
const ZONE_TTL_MS = 6 * 60 * 60 * 1000;
const ZONE_CONCURRENCY = 6;
const ZONE_MAX_PER_REQUEST = 120;
const ZONE_TIMEOUT_MS = 4000;
const zoneCache = new Map(); // url -> { at, geometry }

// Warnings first so the most important polygons fill before the cap.
const LAYER_PRIORITY = ["tornado", "severe", "tornado_watch", "severe_watch", "flood", "winter", "wind", "fire", "heat", "fog"];

export function clearZoneCache() {
  zoneCache.clear();
}

// ~1 km: plenty for a zone outline on a phone, and keeps /api/alerts small.
const ZONE_MIN_STEP_DEG = 0.01;

function roundRing(ring) {
  const out = [];
  let last = null;
  const points = ring || [];
  for (let i = 0; i < points.length; i += 1) {
    const lon = Math.round(Number(points[i]?.[0]) * 1000) / 1000;
    const lat = Math.round(Number(points[i]?.[1]) * 1000) / 1000;
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
    const closing = i === points.length - 1;
    if (last && !closing && Math.abs(lon - last[0]) < ZONE_MIN_STEP_DEG && Math.abs(lat - last[1]) < ZONE_MIN_STEP_DEG) continue;
    if (last && lon === last[0] && lat === last[1]) continue;
    last = [lon, lat];
    out.push(last);
  }
  return out.length >= 4 ? out : null;
}

// Polygon or MultiPolygon -> list of polygons (each a list of rings), lightly simplified.
export function zonePolygons(geometry) {
  if (!geometry) return [];
  const polys = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.type === "MultiPolygon" ? geometry.coordinates : [];
  return (polys || [])
    .map((rings) => (rings || []).map(roundRing).filter(Boolean))
    .filter((rings) => rings.length > 0);
}

function isNwsZoneUrl(url) {
  return /^https:\/\/api\.weather\.gov\/zones\/[a-z]+\/[A-Z]{2}[CZ]\d{3}$/.test(String(url || ""));
}

async function loadZone(url, fetchImpl, now) {
  const hit = zoneCache.get(url);
  if (hit && now - hit.at < ZONE_TTL_MS) return hit.geometry;
  try {
    const response = await fetchImpl(url, {
      headers: NWS_HEADERS,
      // Zone shapes rarely change; let Cloudflare's edge cache them for a day.
      cf: { cacheTtl: 86400, cacheEverything: true },
      signal: typeof AbortSignal !== "undefined" && AbortSignal.timeout ? AbortSignal.timeout(ZONE_TIMEOUT_MS) : undefined,
    });
    if (!response.ok) return null;
    const payload = await response.json();
    const polygons = zonePolygons(payload?.geometry);
    const geometry = polygons.length ? polygons : null;
    zoneCache.set(url, { at: now, geometry });
    return geometry;
  } catch {
    return null;
  }
}

async function runLimited(items, limit, worker) {
  let index = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const item = items[index];
      index += 1;
      await worker(item);
    }
  });
  await Promise.all(runners);
}

/**
 * Fills geometry for features whose geometry is null, from their affectedZones.
 * Never throws; features it can't fill keep geometry: null.
 */
export async function fillZoneGeometry(features, { fetchImpl = fetch, now = Date.now(), concurrency = ZONE_CONCURRENCY, maxZones = ZONE_MAX_PER_REQUEST } = {}) {
  const missing = (features || []).filter((feature) => !feature?.geometry && Array.isArray(feature?.properties?.affectedZones));
  if (!missing.length) return features;
  const rank = (feature) => {
    const at = LAYER_PRIORITY.indexOf(feature?.properties?.ynkLayer);
    return at === -1 ? LAYER_PRIORITY.length : at;
  };
  const ordered = [...missing].sort((a, b) => rank(a) - rank(b));
  const urls = [];
  const seen = new Set();
  for (const feature of ordered) {
    for (const url of feature.properties.affectedZones) {
      if (!isNwsZoneUrl(url) || seen.has(url)) continue;
      seen.add(url);
      urls.push(url);
    }
  }
  const wanted = urls.slice(0, maxZones);
  const shapes = new Map();
  await runLimited(wanted, Math.max(1, concurrency), async (url) => {
    shapes.set(url, await loadZone(url, fetchImpl, now));
  });
  return features.map((feature) => {
    if (feature?.geometry || !Array.isArray(feature?.properties?.affectedZones)) return feature;
    const polygons = feature.properties.affectedZones.flatMap((url) => shapes.get(url) || []);
    if (!polygons.length) return feature;
    return {
      ...feature,
      geometry: { type: "MultiPolygon", coordinates: polygons },
      properties: { ...feature.properties, ynkGeometry: "zones" },
    };
  });
}

async function fetchEvents(events, { fetchImpl = fetch } = {}) {
  const results = await Promise.all(
    events.map(async (event) => {
      const url = `https://api.weather.gov/alerts/active?status=actual&event=${encodeURIComponent(event)}`;
      const response = await fetchImpl(url, { headers: NWS_HEADERS });
      if (!response.ok) {
        throw new Error(`NWS ${response.status} for ${event}`);
      }
      return response.json();
    })
  );

  const features = [];
  const seen = new Set();

  for (const payload of results) {
    for (const feature of payload?.features || []) {
      const id = feature?.id || feature?.properties?.id;
      const key = id || JSON.stringify(feature?.geometry?.coordinates?.[0]?.[0]);
      if (seen.has(key)) continue;
      seen.add(key);
      const event = feature?.properties?.event;
      features.push({
        ...feature,
        properties: {
          ...(feature.properties || {}),
          ynkLayer: EVENT_LAYER[event] || "",
        },
      });
    }
  }

  return {
    type: "FeatureCollection",
    features: await fillZoneGeometry(features, { fetchImpl }),
    title: "Active weather alerts",
    updated: new Date().toISOString(),
  };
}

async function fetchPointAlerts(point) {
  const url = `https://api.weather.gov/alerts/active?status=actual&point=${encodeURIComponent(point)}`;
  const response = await fetch(url, { headers: NWS_HEADERS });
  if (!response.ok) {
    throw new Error(`NWS ${response.status} for point alerts`);
  }
  const payload = await response.json();
  return {
    type: "FeatureCollection",
    features: payload?.features || [],
    title: "Active local alerts",
    updated: new Date().toISOString(),
  };
}

export { ALERT_EVENTS, EVENT_LAYER, fetchEvents };

export async function onRequestGet(context) {
  const search = new URL(context.request.url).searchParams;
  const point = search.get("point");
  const rawType = search.get("type") || "tornado";
  const type = TYPE_ALIASES[rawType] || rawType;

  try {
    if (point) {
      return Response.json(await fetchPointAlerts(point), {
        headers: { "Cache-Control": "public, max-age=60" },
      });
    }

    const events = type === "all" ? Object.values(ALERT_EVENTS).flat() : ALERT_EVENTS[type];
    if (!events) {
      return Response.json({ error: `Unknown alert type: ${type}` }, { status: 400 });
    }

    return Response.json(await fetchEvents(events), {
      headers: {
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (err) {
    return Response.json(
      { type: "FeatureCollection", features: [], error: err.message || "Alerts unavailable" },
      { status: 502 }
    );
  }
}
