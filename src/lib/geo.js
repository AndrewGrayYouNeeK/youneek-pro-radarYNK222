const EARTH_RADIUS_KM = 6371;
const EARTH_RADIUS_MI = 3958.8;

export function haversineKm(lat1, lon1, lat2, lon2) {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function haversineMi(lat1, lon1, lat2, lon2) {
  return haversineKm(lat1, lon1, lat2, lon2) * (EARTH_RADIUS_MI / EARTH_RADIUS_KM);
}

export function clampLatLon(lat, lon) {
  return {
    lat: Math.max(-85, Math.min(85, Number(lat))),
    lon: ((((Number(lon) + 180) % 360) + 360) % 360) - 180,
  };
}

const CARDINALS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];

export function bearingDegrees(lat1, lon1, lat2, lon2) {
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

export function bearingToCardinal(degrees) {
  if (!Number.isFinite(degrees)) return "";
  const normalized = ((degrees % 360) + 360) % 360;
  return CARDINALS[Math.round(normalized / 22.5) % 16];
}

export function describeApproach(origin, point, speedMph = 25) {
  if (!origin || !point) return null;
  const miles = haversineMi(origin.lat, origin.lon, point.lat, point.lon);
  const bearing = (bearingDegrees(origin.lat, origin.lon, point.lat, point.lon) + 360) % 360;
  const speed = Math.max(Number(speedMph) || 25, 8);
  return {
    miles,
    bearing,
    cardinal: bearingToCardinal(bearing),
    speedMph: Math.round(speed),
    etaMinutes: Math.max(1, Math.round((miles / speed) * 60)),
  };
}

export function nearestPoint(origin, points, pick = (item) => item) {
  if (!origin || !points?.length) return null;
  let best = null;
  let bestMi = Infinity;
  for (const item of points) {
    const point = pick(item);
    if (!Number.isFinite(point?.lat) || !Number.isFinite(point?.lon)) continue;
    const miles = haversineMi(origin.lat, origin.lon, point.lat, point.lon);
    if (miles < bestMi) {
      bestMi = miles;
      best = { item, miles };
    }
  }
  return best;
}

export function sunLatLon(date = new Date()) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start) / 86400000);
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60;
  return {
    lat: 23.44 * Math.sin((2 * Math.PI * (dayOfYear - 81)) / 365),
    lon: 180 - hours * 15,
  };
}
