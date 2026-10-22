const RAIN_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99]);

function minuteTime(minute) {
  const time = Date.parse(minute?.time);
  return Number.isFinite(time) ? time : NaN;
}

export function isWetMinute(minute) {
  const intensity = Number(minute?.intensity) || 0;
  const chance = Number(minute?.chance) || 0;
  return intensity > 0.05 || chance >= 50;
}

export function isRainOrStorm(current) {
  const code = Number(current?.weather_code);
  if (RAIN_CODES.has(code)) return true;
  const label = `${current?.condition_code || ""} ${current?.condition_label || ""}`.toLowerCase();
  return /rain|drizzle|shower|thunder|storm/.test(label);
}

export function rainTimingLabel(minutes = [], now = Date.now()) {
  if (!minutes?.length) return "Minute precipitation unavailable";
  const nextWet = minutes.find((minute) => {
    const time = minuteTime(minute);
    if (Number.isFinite(time) && time < now) return false;
    return isWetMinute(minute);
  });
  if (!nextWet) return "No rain in the next hour";
  const delta = Math.round((minuteTime(nextWet) - now) / 60000);
  if (!Number.isFinite(delta) || delta <= 1) return "Rain is starting now";
  return `Rain starts in ${delta} min`;
}

function firstUpcomingWet(minutes, now) {
  return (minutes || []).find((minute) => {
    const time = minuteTime(minute);
    if (Number.isFinite(time) && time < now) return false;
    return isWetMinute(minute);
  });
}

export function rainArrivalFromForecast({
  openMeteoMinutes = [],
  weatherKitMinutes = [],
  now = Date.now(),
} = {}) {
  const openMeteoWet = firstUpcomingWet(openMeteoMinutes, now);
  if (!openMeteoWet) return { status: "dry", minutesUntilRain: null };

  const bucketStart = minuteTime(openMeteoWet);
  const bucketEnd = Number.isFinite(bucketStart) ? bucketStart + 15 * 60 * 1000 : Infinity;
  const finer = (weatherKitMinutes || []).find((minute) => {
    const time = minuteTime(minute);
    if (!isWetMinute(minute)) return false;
    if (Number.isFinite(time) && time < now) return false;
    if (!Number.isFinite(time) || !Number.isFinite(bucketStart)) return true;
    return time >= bucketStart && time < bucketEnd;
  });
  const chosen = finer || openMeteoWet;
  const delta = Math.round((minuteTime(chosen) - now) / 60000);
  if (!Number.isFinite(delta) || delta <= 1) return { status: "rain_now", minutesUntilRain: 0 };
  return { status: "rain_soon", minutesUntilRain: delta };
}

export function refineMinuteSeries(openMeteoMinutes = [], weatherKitMinutes = [], now = Date.now()) {
  const detail = (weatherKitMinutes || []).filter((minute) => {
    const time = minuteTime(minute);
    return Number.isFinite(time) && time >= now && time <= now + 60 * 60 * 1000;
  });
  if (!detail.length) return openMeteoMinutes;
  const later = (openMeteoMinutes || []).filter((minute) => minuteTime(minute) > now + 60 * 60 * 1000);
  return [...detail, ...later];
}
