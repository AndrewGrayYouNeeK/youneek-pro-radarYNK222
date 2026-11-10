export function formatRadarFrameAge(unixSeconds, nowMs = Date.now()) {
  const time = Number(unixSeconds);
  if (!Number.isFinite(time) || time <= 0) return "";
  const deltaSec = Math.round(nowMs / 1000 - time);
  if (deltaSec < -90) {
    const ahead = Math.max(1, Math.round(-deltaSec / 60));
    return ahead === 1 ? "Forecast · in 1 min" : `Forecast · in ${ahead} min`;
  }
  if (deltaSec < 45) return "Updated just now";
  const mins = Math.max(1, Math.round(deltaSec / 60));
  if (mins < 60) return `Updated ${mins} min ago`;
  const hours = Math.round(mins / 60);
  return hours === 1 ? "Updated 1 hr ago" : `Updated ${hours} hr ago`;
}

let cachedFrame = { at: 0, time: null };

export async function latestRadarFrameUnix(fetchImpl = globalThis.fetch, nowMs = Date.now()) {
  if (cachedFrame.time && nowMs - cachedFrame.at < 60000) return cachedFrame.time;
  const response = await fetchImpl("https://api.rainviewer.com/public/weather-maps.json");
  if (!response?.ok) throw new Error("Radar catalog unavailable");
  const payload = await response.json();
  const past = payload?.radar?.past || [];
  const time = past.length ? Number(past[past.length - 1].time) : null;
  cachedFrame = { at: nowMs, time: Number.isFinite(time) ? time : null };
  return cachedFrame.time;
}

export function resetRadarFrameAgeCache() {
  cachedFrame = { at: 0, time: null };
}
