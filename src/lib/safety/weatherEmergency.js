export const RECENT_EMERGENCY_MS = 12 * 60 * 60 * 1000;
export const EMERGENCY_STORAGE_KEY = "weatherEmergency_v1";

const WATCH_EVENTS = [
  "tornado watch",
  "severe thunderstorm watch",
  "hurricane watch",
  "tropical storm watch",
  "storm surge watch",
  "extreme wind watch",
  "flash flood watch",
];

function text(value) {
  return String(value || "").toLowerCase();
}

export function isWeatherEmergency(alert) {
  if (!alert) return false;
  const name = text(alert.name || alert.event);
  const severity = text(alert.severity);
  if (!name && !severity) return false;
  if (name.includes("advisory") || name.includes("statement") || name.includes("outlook")) {
    return false;
  }
  if (name.includes("warning")) return true;
  if (WATCH_EVENTS.some((event) => name.includes(event))) return true;
  return severity === "extreme" || severity === "severe";
}

export function emergencyAlerts(alerts = []) {
  return (Array.isArray(alerts) ? alerts : []).filter(isWeatherEmergency);
}

function storageFor(storage) {
  if (storage) return storage;
  try {
    return globalThis.localStorage || null;
  } catch {
    return null;
  }
}

export function rememberEmergencies(alerts, now = Date.now(), storage) {
  const live = emergencyAlerts(alerts);
  if (!live.length) return readRememberedEmergencies(now, storage);

  const endTimes = live.map((alert) => Date.parse(alert.expires || alert.ends || "")).filter(Number.isFinite);
  const latestEnd = endTimes.length ? Math.max(...endTimes) : now;
  const until = Math.max(latestEnd, now) + RECENT_EMERGENCY_MS;
  const record = {
    savedAt: now,
    until,
    alerts: live.slice(0, 8).map((alert) => ({
      id: alert.id,
      name: alert.name,
      expires: alert.expires || alert.ends || null,
      severity: alert.severity || "",
    })),
  };

  const store = storageFor(storage);
  try {
    store?.setItem(EMERGENCY_STORAGE_KEY, JSON.stringify(record));
  } catch {
    /* ignore quota / private mode */
  }
  return { active: true, recent: false, visible: true, until, alerts: live };
}

export function readRememberedEmergencies(now = Date.now(), storage) {
  const store = storageFor(storage);
  try {
    const record = JSON.parse(store?.getItem(EMERGENCY_STORAGE_KEY) || "null");
    if (!record || !Number.isFinite(record.until) || record.until < now) {
      return { active: false, recent: false, visible: false, until: 0, alerts: [] };
    }
    return {
      active: false,
      recent: true,
      visible: true,
      until: record.until,
      alerts: record.alerts || [],
    };
  } catch {
    return { active: false, recent: false, visible: false, until: 0, alerts: [] };
  }
}

export function resolveEmergencyState(alerts = [], now = Date.now(), storage) {
  const live = emergencyAlerts(alerts);
  if (live.length) return rememberEmergencies(live, now, storage);
  return readRememberedEmergencies(now, storage);
}
