export const DEFAULT_WEATHER_APP_URL = "https://youneek-pro-radarynk222.youneekartifacts.workers.dev";

export function isLandingSite() {
  return import.meta.env.VITE_SITE === "landing";
}

export function weatherAppOrigin() {
  const fromEnv = String(import.meta.env.VITE_WEATHER_APP_URL || "").replace(/\/$/, "");
  return fromEnv || DEFAULT_WEATHER_APP_URL;
}

export function appHref(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!isLandingSite()) return normalized;
  return `${weatherAppOrigin()}${normalized}`;
}
