import { isNativePlatform } from "./native/runtime.js";

/**
 * Free web preview vs the paid app.
 * The native (Capacitor) app is a $6.99 one-time purchase, so everything is unlocked there.
 * The website is a free preview: basic radar, loop, map, and tornado/severe warning outlines.
 * Gating is UI-only. Radar, velocity, tornado-hook, and alert code paths are unchanged in the app.
 */
export const GET_APP_URL = "https://youneekproradar.com";
export const PREMIUM_LABEL = "Premium in the app";

/** Decided once at load. Capacitor sets the native bridge before the bundle runs. */
export const PREMIUM_UNLOCKED = isPremiumUnlocked();

export function isPremiumUnlocked(native = isNativePlatform()) {
  return native === true;
}

/** Radar products only in the app (velocity shows rotation / tornado hooks). */
export const PREMIUM_PRODUCTS = ["velocity", "stormRelative"];

/**
 * Layer toggles only in the app. Tornado and severe thunderstorm warnings plus
 * tornado and severe watches stay free on the web for public safety.
 */
export const PREMIUM_LAYER_KEYS = ["future", "cells", "stormReports", "md", "flood", "winter", "heat", "windAlert", "fireWx"];

/** What the paid app adds, shown on web lock states. */
export const PREMIUM_FEATURES = [
  "Base and storm-relative velocity (rotation and tornado hooks)",
  "Storm distance",
  "Rain in X minutes",
  "Flood, winter, heat, wind, and fire weather alert polygons",
  "Future radar, storm cells, storm reports, and mesoscale discussions",
  "Safety contacts with I’m Safe and I Need Help texts",
  "NOAA Weather Radio",
];

export function radarProductFor(productId, premium = PREMIUM_UNLOCKED) {
  const id = productId || "reflectivity";
  if (premium) return id;
  return PREMIUM_PRODUCTS.includes(id) ? "reflectivity" : id;
}

export function isProductLocked(productId, premium = PREMIUM_UNLOCKED) {
  return !premium && PREMIUM_PRODUCTS.includes(productId);
}

export function isLayerLocked(key, premium = PREMIUM_UNLOCKED) {
  return !premium && PREMIUM_LAYER_KEYS.includes(key);
}
