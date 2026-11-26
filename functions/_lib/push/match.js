import { zoneCode } from "./coarse.js";

// Only the warnings that mean "act now" go to lock screens.
export const PUSH_EVENTS = ["Tornado Warning", "Severe Thunderstorm Warning", "Flash Flood Warning"];
// Coarse cells are ~11 km; give the polygon that much slack so edge users are not missed.
const POLYGON_SLACK_DEG = 0.15;

export function alertId(feature) {
  return String(feature?.properties?.id || feature?.id || "");
}

// New, still-active warnings only. Updates/cancels are not re-pushed.
export function pushableAlerts(features = [], now = Date.now()) {
  return (features || []).filter((feature) => {
    const p = feature?.properties || {};
    if (!PUSH_EVENTS.includes(p.event)) return false;
    if (p.status && p.status !== "Actual") return false;
    if (p.messageType && p.messageType !== "Alert") return false;
    const ends = Date.parse(p.ends || p.expires || "");
    if (Number.isFinite(ends) && ends <= now) return false;
    return Boolean(alertId(feature));
  });
}

export function alertZones(feature) {
  const p = feature?.properties || {};
  const codes = [...(p.geocode?.UGC || []), ...(p.affectedZones || []).map(zoneCode)];
  return new Set(codes.filter(Boolean));
}

function rings(geometry) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return [geometry.coordinates?.[0] || []];
  if (geometry.type === "MultiPolygon") return (geometry.coordinates || []).map((poly) => poly?.[0] || []);
  return [];
}

function pointInRing(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi || 1e-12) + xi) inside = !inside;
  }
  return inside;
}

function nearRing(lon, lat, ring, slack) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of ring) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  if (lon < minX - slack || lon > maxX + slack || lat < minY - slack || lat > maxY + slack) return false;
  if (pointInRing(lon, lat, ring)) return true;
  // Inside the slack band around the polygon: check the slack-shifted points.
  for (const [dx, dy] of [[slack, 0], [-slack, 0], [0, slack], [0, -slack]]) {
    if (pointInRing(lon + dx, lat + dy, ring)) return true;
  }
  return false;
}

/**
 * A device matches when one of its NWS zones/counties is in the alert, and, when
 * the alert has a storm polygon and the device has a coarse cell, that cell is in
 * or next to the polygon (warnings are polygons, not whole counties).
 * A device with no zones matches on the polygon alone.
 */
export function deviceMatchesAlert(device, feature) {
  const zones = alertZones(feature);
  const zoneHit = (device?.zones || []).some((code) => zones.has(code));
  const polys = rings(feature?.geometry);
  const cell = device?.cell;
  if (polys.length && cell) {
    const near = polys.some((ring) => nearRing(cell.lon, cell.lat, ring, POLYGON_SLACK_DEG));
    return near && (zoneHit || !(device?.zones || []).length);
  }
  return zoneHit;
}
