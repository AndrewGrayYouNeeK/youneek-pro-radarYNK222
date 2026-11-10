export const NWR_LISTING_URL = "https://www.weather.gov/source/nwr/JS/ccl-data.js";
export const NWR_LISTING_PAGE = "https://www.weather.gov/nwr/stations";

export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function parseCclPayload(source) {
  const text = String(source || "");
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start < 0 || end < start) return [];
  let rows;
  try {
    rows = JSON.parse(text.slice(start, end + 1));
  } catch {
    return [];
  }
  if (!Array.isArray(rows)) return [];
  return rows.map(normalizeTransmitter).filter(Boolean);
}

export function normalizeTransmitter(row) {
  const lat = Number(row?.lat);
  const lon = Number(row?.lon);
  const callsign = String(row?.callsign || "").trim();
  const frequencyMHz = String(row?.freq || "").trim();
  if (!callsign || !frequencyMHz || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return {
    id: callsign,
    callsign,
    name: String(row?.sitename || row?.siteloc || callsign).trim(),
    state: String(row?.sitestate || "").trim(),
    frequencyMHz,
    lat,
    lon,
    status: String(row?.status || "").trim(),
  };
}

export function nearestTransmitters(stations, lat, lon, limit = 8) {
  const latitude = Number(lat);
  const longitude = Number(lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return [];
  return (stations || [])
    .map((station) => ({
      ...station,
      distanceKm: haversineKm(latitude, longitude, station.lat, station.lon),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

export function tuneInstruction(station) {
  if (!station?.frequencyMHz || !station?.callsign) return "Tune a weather radio to a NOAA Weather Radio frequency.";
  return `Tune your weather radio to ${station.frequencyMHz} MHz (${station.callsign}).`;
}
