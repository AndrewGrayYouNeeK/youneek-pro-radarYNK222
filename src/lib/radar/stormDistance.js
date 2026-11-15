const CARDINAL_DIRS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];

export function bearingToCardinal(deg) {
  return CARDINAL_DIRS[Math.round((((Number(deg) % 360) + 360) % 360) / 22.5) % 16];
}

export function etaLabel(etaMinutes) {
  if (!(etaMinutes >= 1)) return "< 1 min";
  if (etaMinutes < 60) return `${etaMinutes} min`;
  return `${(etaMinutes / 60).toFixed(1)} hr`;
}

// One-line storm distance for the clean radar: "12.3 mi NNE · ~25 mph · ETA 30 min"
export function stormDistanceSummary(stormData) {
  if (!stormData || !Number.isFinite(Number(stormData.distanceMi))) return "";
  const { bearing, distanceMi, speedMph, etaMinutes } = stormData;
  return `${distanceMi} mi ${bearingToCardinal(bearing)} · ~${speedMph} mph · ETA ${etaLabel(etaMinutes)}`;
}
