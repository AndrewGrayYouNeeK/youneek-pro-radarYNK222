// Coarse location only: ~0.1° (about 11 km). Precise GPS never reaches the server.
export const COARSE_STEP = 0.1;

export function roundCoarse(value) {
  if (value == null || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.round(n / COARSE_STEP) * COARSE_STEP;
}

export function coarseCell(lat, lon) {
  const rLat = roundCoarse(lat);
  const rLon = roundCoarse(lon);
  if (rLat == null || rLon == null || Math.abs(rLat) > 90 || Math.abs(rLon) > 180) return null;
  return { lat: Number(rLat.toFixed(1)), lon: Number(rLon.toFixed(1)) };
}

// "TXZ119" / "TXC113" from an NWS zone URL or a bare code.
export function zoneCode(value) {
  const match = String(value || "").match(/([A-Z]{2}[CZ]\d{3})\/?$/);
  return match ? match[1] : null;
}
