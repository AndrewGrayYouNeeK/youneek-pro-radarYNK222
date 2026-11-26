// Pure helpers for live warning notifications. No Capacitor imports, so node --test can load this.

export const PUSH_WARNING_EVENTS = ["Tornado Warning", "Severe Thunderstorm Warning", "Flash Flood Warning"];
export const PUSH_REGISTRATION_KEY = "pushRegistration_v1";
export const LOCAL_SENT_KEY = "localWarningNotified_v1";
export const NOTIFY_PROMPT_DISMISS_KEY = "notificationsPromptDismissedAt_v1";
export const REREGISTER_MS = 6 * 60 * 60 * 1000;
export const REGISTRATION_STALE_MS = 30 * 24 * 60 * 60 * 1000;
export const NOTIFY_PROMPT_SNOOZE_MS = 3 * 24 * 60 * 60 * 1000;
export const ANDROID_CHANNEL_ID = "severe-alerts";

export const NOTIFICATIONS_OFF_TEXT =
  "Notifications are off. Turn them on to get Tornado, Severe Thunderstorm, and Flash Flood Warnings for your area, even when the app is closed.";

/** ~11 km grid. Precise GPS never leaves the phone. */
export function coarseCell(lat, lon) {
  if (lat == null || lon == null || lat === "" || lon === "") return null;
  const la = Number(lat);
  const lo = Number(lon);
  if (!Number.isFinite(la) || !Number.isFinite(lo) || Math.abs(la) > 90 || Math.abs(lo) > 180) return null;
  return { lat: Math.round(la * 10) / 10, lon: Math.round(lo * 10) / 10 };
}

export function sameCell(a, b) {
  return Boolean(a && b && a.lat === b.lat && a.lon === b.lon);
}

export function parseRegistration(raw) {
  try {
    const value = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!value || typeof value !== "object") return null;
    return value;
  } catch {
    return null;
  }
}

/** Register again when the token or ~11 km cell changed, or every 6 hours to refresh the server TTL and zones. */
export function needsRegistration(previous, { token, cell, now = Date.now() } = {}) {
  if (!token || !cell) return false;
  if (!previous) return true;
  if (previous.token !== token) return true;
  if (!sameCell(previous.cell, cell)) return true;
  return !(now - Number(previous.at || 0) < REREGISTER_MS);
}

/** Server pushes cover this phone when a registration succeeded recently. */
export function serverPushActive(previous, now = Date.now()) {
  return Boolean(previous?.ok && now - Number(previous.at || 0) < REGISTRATION_STALE_MS);
}

export function normalizeNotifyPermission(value) {
  if (value === "granted" || value === "denied") return value;
  if (value === "prompt" || value === "prompt-with-rationale") return "prompt";
  return "unknown";
}

export function notificationsOff(permission) {
  return permission === "denied";
}

export function promptSnoozed(dismissedAt, now = Date.now()) {
  const at = Number(dismissedAt);
  return Number.isFinite(at) && at > 0 && now - at < NOTIFY_PROMPT_SNOOZE_MS;
}

/** Warnings worth a local notification that were not notified before. */
export function newLocalWarnings(alerts, notifiedIds = [], now = Date.now()) {
  const seen = new Set(notifiedIds);
  return (Array.isArray(alerts) ? alerts : []).filter((alert) => {
    if (!alert?.id || seen.has(alert.id)) return false;
    if (!PUSH_WARNING_EVENTS.includes(alert.name || alert.event)) return false;
    const expires = Date.parse(alert.expires || "");
    return !(Number.isFinite(expires) && expires < now);
  });
}

/** Stable 31-bit int id for LocalNotifications (Android needs a Java int). */
export function localNotificationId(alertId) {
  let hash = 0;
  for (const char of String(alertId || "")) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return Math.abs(hash) % 2147483647 || 1;
}

export function localWarningNotification(alert) {
  const event = alert.name || alert.event || "Weather Warning";
  const action = /tornado/i.test(event)
    ? "Take shelter now."
    : /flood/i.test(event)
      ? "Move to higher ground now."
      : "Move indoors, away from windows.";
  return {
    id: localNotificationId(alert.id),
    title: event,
    body: `${action} Tap for radar and I'm Safe / I Need Help.`,
    channelId: ANDROID_CHANNEL_ID,
    extra: { alertId: alert.id, route: "/Radar" },
  };
}

export function rememberNotified(ids, added, max = 100) {
  return [...new Set([...(ids || []), ...added])].slice(-max);
}
