import { haversineMi } from "./geo.js";

export const GPS_HOLD_MILES = 0.3;

export function holdGpsLocation(previous, fix, thresholdMiles = GPS_HOLD_MILES) {
  if (!previous || previous.source !== "gps" || !fix) return null;
  if (!Number.isFinite(previous.lat) || !Number.isFinite(previous.lon)) return null;
  if (!Number.isFinite(fix.lat) || !Number.isFinite(fix.lon)) return null;
  const miles = haversineMi(previous.lat, previous.lon, fix.lat, fix.lon);
  if (!(miles < thresholdMiles)) return null;
  return {
    ...previous,
    lat: previous.lat,
    lon: previous.lon,
    accuracy: fix.accuracy,
    source: "gps",
  };
}

export function roundCoord(value, decimals = 2) {
  const number = Number(value);
  if (!Number.isFinite(number)) return value;
  const factor = 10 ** decimals;
  return Math.round(number * factor) / factor;
}

export function weatherQueryCoords(lat, lon, decimals = 2) {
  return [roundCoord(lat, decimals), roundCoord(lon, decimals)];
}

export function showWeatherSkeleton({ hasData, isLoading, locationLoading }) {
  if (hasData) return false;
  return Boolean(isLoading || locationLoading);
}
