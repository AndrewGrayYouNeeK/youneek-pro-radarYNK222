// Pure rules for the "Location is off" prompt. No network, no tracking.
// permission: "granted" | "denied" | "prompt" | "unknown"
// servicesOff: device-wide Location Services are switched off (native only).

export const LOCATION_OFF_TEXT =
  "Location is off. Turn it on to see storms near you and use I'm Safe / I Need Help.";
export const LOCATION_PROMPT_DISMISS_KEY = "locationPromptDismissedAt_v1";
export const LOCATION_PROMPT_SNOOZE_MS = 24 * 60 * 60 * 1000;

export function normalizePermission(value) {
  const text = String(value || "").toLowerCase();
  if (text === "granted") return "granted";
  if (text === "denied") return "denied";
  if (text.startsWith("prompt")) return "prompt";
  return "unknown";
}

export function locationIsOff({ permission, servicesOff = false, gpsStatus = "" } = {}) {
  if (servicesOff) return true;
  const state = normalizePermission(permission);
  if (state === "denied" || state === "prompt") return true;
  if (state === "granted") return false;
  return gpsStatus === "denied" || gpsStatus === "unavailable";
}

// What the Turn On Location button should do.
export function locationPromptAction({ permission, servicesOff = false, native = false } = {}) {
  const state = normalizePermission(permission);
  if (native) {
    if (servicesOff || state === "denied") return "settings";
    return "request";
  }
  if (state === "denied") return "instructions";
  return "request";
}

export function webLocationInstructions(userAgent = "") {
  if (/iPhone|iPad|iPod/.test(userAgent)) {
    return "In Safari, tap the aA button in the address bar, then Website Settings → Location → Allow. Or go to Settings → Privacy & Security → Location Services → Safari Websites → While Using the App.";
  }
  if (/Android/.test(userAgent)) {
    return "Tap the lock or settings icon next to the address, then Permissions → Location → Allow. Make sure Location is on in your phone's quick settings.";
  }
  return "Click the lock or site-settings icon next to the address, set Location to Allow, then reload. You can also search for a city on the map.";
}

export function servicesOffInstructions(platform = "") {
  if (platform === "android") {
    return "Location is switched off for the whole phone. Swipe down from the top and turn on Location, then come back.";
  }
  return "Location Services are off for the whole phone. Go to Settings → Privacy & Security → Location Services and turn them on, then allow YouNeeK Pro Radar While Using the App.";
}

export function promptSnoozed(dismissedAt, now = Date.now()) {
  const at = Number(dismissedAt);
  return Number.isFinite(at) && at > 0 && now - at < LOCATION_PROMPT_SNOOZE_MS;
}
