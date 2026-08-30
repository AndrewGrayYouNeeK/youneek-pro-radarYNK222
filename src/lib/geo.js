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
