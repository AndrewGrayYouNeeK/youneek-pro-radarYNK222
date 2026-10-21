export function rainTimingLabel(minutes = [], now = Date.now()) {
  if (!minutes?.length) return "Minute precipitation unavailable";
  const nextWet = minutes.find((minute) => minute.intensity > 0.01 || minute.chance >= 20);
  if (!nextWet) return "No rain in the next hour";
  const delta = Math.round((Date.parse(nextWet.time) - now) / 60000);
  if (!Number.isFinite(delta) || delta <= 1) return "Rain is starting now";
  return `Rain starts in ${delta} min`;
}
