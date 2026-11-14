/**
 * Synthetic Category 4 hurricane for the demo overlay only.
 * Nothing here is fetched, cached, or drawn unless demo=hurricane is on.
 */

export const DEMO_FEATURE_ID = "demo-hurricane-warning";

export const STORM_CENTER = { lat: 28.05, lon: -94.15 };

/** KHGX, Houston/Galveston — the velocity couplet is radial from this site. */
export const VELOCITY_RADAR = { lat: 29.472, lon: -95.079 };

export const DEMO_CAMERAS = {
  overview: { lat: 28.78, lon: -94.48, zoom: 6.5 },
  eye: { lat: 28.05, lon: -94.15, zoom: 9 },
  alert: { lat: 28.9, lon: -94.62, zoom: 6.5 },
  velocity: { lat: 28.05, lon: -94.15, zoom: 8.5 },
};

/** Same stroke/fill as the live NWS warning painter in RadarDisplay. */
export const WARNING_POLYGON_STYLE = {
  color: "#ef4444",
  weight: 2,
  opacity: 0.95,
  fillColor: "#ef4444",
  fillOpacity: 0.18,
};

export const REFLECTIVITY_STOPS = [
  { dbz: 5, color: "#38bdf8", label: "5 dBZ" },
  { dbz: 20, color: "#84cc16", label: "20 dBZ" },
  { dbz: 35, color: "#eab308", label: "35 dBZ" },
  { dbz: 45, color: "#f97316", label: "45 dBZ" },
  { dbz: 55, color: "#ef4444", label: "55 dBZ" },
  { dbz: 65, color: "#d946ef", label: "65+ dBZ" },
];

export const VELOCITY_STOPS = [
  { ms: -36, color: "#16a34a", label: "Inbound" },
  { ms: -10, color: "#86efac", label: "Light inbound" },
  { ms: 10, color: "#fecaca", label: "Light outbound" },
  { ms: 36, color: "#ef4444", label: "Outbound" },
];

/** Closed ring, [lon, lat]. Coastal counties from Matagorda Bay through Jefferson. */
export const WARNING_RING = [
  [-96.12, 28.52],
  [-95.55, 28.68],
  [-95.05, 28.92],
  [-94.55, 29.22],
  [-94.05, 29.48],
  [-93.72, 29.68],
  [-93.7, 30.08],
  [-94.18, 30.12],
  [-94.62, 29.98],
  [-95.05, 29.82],
  [-95.42, 29.52],
  [-95.85, 29.22],
  [-96.18, 28.98],
  [-96.12, 28.52],
];

const EYE_KM = 24;
const EYEWALL_INNER_KM = 32;
const EYEWALL_PEAK_KM = 42;
const EYEWALL_OUTER_KM = 68;
const KM_PER_DEG = 111;

function hexToRgb(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function lerpRgb(a, b, t) {
  return a.map((channel, index) => Math.round(channel + (b[index] - channel) * t));
}

function angleDiff(a, b) {
  let delta = a - b;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
}

function fade(t) {
  return t * t * (3 - 2 * t);
}

function hash(ix, iy) {
  const n = Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function valueNoise(x, y) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = fade(x - x0);
  const ty = fade(y - y0);
  const a = hash(x0, y0);
  const b = hash(x0 + 1, y0);
  const c = hash(x0, y0 + 1);
  const d = hash(x0 + 1, y0 + 1);
  return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
}

export function offsetKm(lat, lon, eastKm, northKm) {
  return {
    lat: lat + northKm / KM_PER_DEG,
    lon: lon + eastKm / (KM_PER_DEG * Math.cos((lat * Math.PI) / 180)),
  };
}

export function toLocalKm(lat, lon, origin = STORM_CENTER) {
  const x = (lon - origin.lon) * KM_PER_DEG * Math.cos((origin.lat * Math.PI) / 180);
  const y = (lat - origin.lat) * KM_PER_DEG;
  return { x, y, r: Math.hypot(x, y), theta: Math.atan2(y, x) };
}

function adjustedRadius(r, theta) {
  const stretch = 1 + 0.1 * Math.cos(2 * (theta - Math.PI / 5));
  return r / stretch;
}

export function reflectivityDbz(lat, lon) {
  const { x, y, r, theta } = toLocalKm(lat, lon);
  if (r > 460) return 0;
  const radius = adjustedRadius(r, theta);
  const northeast = 0.8 + 0.2 * Math.cos(theta - Math.PI / 4);

  if (radius < EYE_KM) return 0;

  if (radius < EYEWALL_OUTER_KM) {
    const sigma = radius < EYEWALL_PEAK_KM ? 7.5 : 12;
    const core = Math.exp(-((radius - EYEWALL_PEAK_KM) ** 2) / (2 * sigma * sigma));
    const edge = radius < EYEWALL_INNER_KM ? (radius - EYE_KM) / (EYEWALL_INNER_KM - EYE_KM) : 1;
    return Math.min(72, 64 * core * northeast * Math.min(1, edge * 1.35));
  }

  const decay = Math.exp(-(radius - EYEWALL_OUTER_KM) / 155);
  const spiral = theta - Math.log(Math.max(radius, 1) / 46) * 1.22;
  const arm = Math.cos(spiral * 2);
  const cells = valueNoise(x / 16, y / 16) * 2 - 1;
  let dbz = 0;
  if (arm > 0.08) {
    const convective = arm ** 1.35;
    dbz = (16 + convective * 34 + Math.max(0, cells) * 14) * decay * (0.85 + 0.15 * northeast);
    if (cells < -0.35 && radius > 130) dbz *= 0.22;
  } else if (cells > 0.55) {
    dbz = 12 * decay;
  }

  const coastAngle = Math.atan2(1, -0.42);
  const flank = angleDiff(theta, coastAngle);
  if (radius > 80 && radius < 240 && Math.abs(flank) < 0.85) {
    const shield = 34 * Math.exp(-((radius - 145) ** 2) / (62 ** 2)) * Math.exp(-(flank ** 2) / 0.22);
    dbz = Math.max(dbz, shield * (0.65 + 0.35 * Math.max(0, cells)));
  }

  if (radius > 390) dbz *= Math.max(0, 1 - (radius - 390) / 70);
  return dbz < 5 ? 0 : Math.min(68, dbz);
}

function tangentialSpeed(r) {
  const maxWind = 68;
  const radiusMax = EYEWALL_PEAK_KM;
  if (r < EYE_KM * 0.85) return 0;
  if (r <= radiusMax) return maxWind * ((r - EYE_KM * 0.5) / (radiusMax - EYE_KM * 0.5));
  return maxWind * (radiusMax / r) ** 0.62;
}

/** Positive is outbound from KHGX (NEXRAD red). Zero inside the clear eye. */
export function radialVelocityMs(lat, lon) {
  const dbz = reflectivityDbz(lat, lon);
  if (dbz < 18) return 0;
  const { x, y, r } = toLocalKm(lat, lon);
  if (r < 8 || r > 240) return 0;
  const speed = tangentialSpeed(r);
  const tx = -y / r;
  const ty = x / r;
  const radar = toLocalKm(VELOCITY_RADAR.lat, VELOCITY_RADAR.lon);
  const rx = x - radar.x;
  const ry = y - radar.y;
  const range = Math.hypot(rx, ry) || 1;
  return ((tx * speed) * rx + (ty * speed) * ry) / range;
}

function colorAlong(stops, value, key) {
  if (value <= stops[0][key]) return hexToRgb(stops[0].color);
  const last = stops[stops.length - 1];
  if (value >= last[key]) return hexToRgb(last.color);
  for (let index = 1; index < stops.length; index += 1) {
    const upper = stops[index];
    const lower = stops[index - 1];
    if (value <= upper[key]) {
      const span = upper[key] - lower[key] || 1;
      const t = (value - lower[key]) / span;
      return lerpRgb(hexToRgb(lower.color), hexToRgb(upper.color), t);
    }
  }
  return hexToRgb(last.color);
}

export function reflectivityRgba(dbz) {
  if (dbz < 5) return null;
  const rgb = colorAlong(REFLECTIVITY_STOPS, Math.min(dbz, 70), "dbz");
  const alpha = Math.round(Math.min(235, 100 + (dbz - 5) * 2.4));
  return [rgb[0], rgb[1], rgb[2], alpha];
}

export function velocityRgba(ms) {
  const mag = Math.abs(ms);
  if (mag < 4) return null;
  const rgb = colorAlong(VELOCITY_STOPS, Math.max(-48, Math.min(48, ms)), "ms");
  const alpha = Math.round(Math.min(230, 80 + mag * 3.1));
  return [rgb[0], rgb[1], rgb[2], alpha];
}

export function sampleStorm(lat, lon, mode) {
  if (mode === "velocity") return velocityRgba(radialVelocityMs(lat, lon));
  return reflectivityRgba(reflectivityDbz(lat, lon));
}

export function warningContains(lat, lon) {
  const ring = WARNING_RING;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect = (yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function trackLatLngs() {
  const heading = (332 * Math.PI) / 180;
  const points = [];
  for (let km = 0; km <= 150; km += 30) {
    const north = Math.cos(heading) * km;
    const east = Math.sin(heading) * km;
    const point = offsetKm(STORM_CENTER.lat, STORM_CENTER.lon, east, north);
    points.push([point.lat, point.lon]);
  }
  return points;
}

export function demoBannerAlert() {
  return {
    id: DEMO_FEATURE_ID,
    name: "Hurricane Warning",
    severity: "Extreme",
    source: "NWS Houston/Galveston",
  };
}

export function demoHurricaneFeature(now = Date.now()) {
  return {
    type: "Feature",
    id: DEMO_FEATURE_ID,
    geometry: {
      type: "Polygon",
      coordinates: [WARNING_RING],
    },
    properties: {
      id: DEMO_FEATURE_ID,
      ynkDemo: "hurricane",
      event: "Hurricane Warning",
      headline: "Hurricane Warning for the upper Texas coast including Galveston Bay",
      description:
        "A category 4 hurricane is moving north-northwest toward the upper Texas coast. The eye is still offshore southeast of Galveston. Hurricane-force winds surround the eye, with spiral rain bands already spreading toward the warned counties. Damaging winds, life-threatening storm surge, and flooding rain are expected along the coast.",
      instruction:
        "Finish preparations now. Follow evacuation orders from local officials. Stay away from the Gulf, bays, and low coastal roads until the warning is cancelled.",
      areaDesc: "Brazoria, Galveston, Chambers, and Jefferson Counties",
      expires: new Date(now + 18 * 60 * 60 * 1000).toISOString(),
      severity: "Extreme",
      senderName: "NWS Houston/Galveston",
    },
  };
}

export function isDemoHurricaneFeature(feature) {
  if (!feature) return false;
  if (feature.id === DEMO_FEATURE_ID) return true;
  return feature.properties?.ynkDemo === "hurricane" || feature.properties?.id === DEMO_FEATURE_ID;
}

export function withDemoHurricaneFeature(payload, now = Date.now()) {
  const base = payload && typeof payload === "object" ? payload : {};
  const existing = Array.isArray(base.features) ? base.features.filter((feature) => !isDemoHurricaneFeature(feature)) : [];
  return {
    ...base,
    type: "FeatureCollection",
    features: [...existing, demoHurricaneFeature(now)],
    error: undefined,
  };
}

/** Drop the synthetic warning before it is written to ynk-alerts-v1. */
export function stripDemoHurricaneFromCache(raw) {
  if (typeof raw !== "string" || !raw.includes(DEMO_FEATURE_ID)) return raw;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return raw;
  }
  const collection = parsed?.data;
  if (!collection || !Array.isArray(collection.features)) return raw;
  const features = collection.features.filter((feature) => !isDemoHurricaneFeature(feature));
  if (features.length === collection.features.length) return raw;
  return JSON.stringify({ ...parsed, data: { ...collection, features } });
}

export function isAlertsCollectionUrl(url) {
  try {
    const parsed = new URL(String(url || ""), "http://localhost");
    return parsed.pathname.endsWith("/api/alerts") && parsed.searchParams.get("type") === "all";
  } catch {
    return false;
  }
}
