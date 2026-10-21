export const MAP_FEATURE_GROUPS = [
  { id: "overlays", label: "Overlays" },
  { id: "warnings", label: "Warnings" },
  { id: "desk", label: "Desk" },
  { id: "safety", label: "Safety" },
];

export const MAP_FEATURES = [
  { id: "radar", label: "Radar", group: "overlays", kind: "layer", defaultDock: true },
  { id: "lightning", label: "Lightning", group: "overlays", kind: "layer", defaultDock: true },
  { id: "satellite", label: "Satellite", group: "overlays", kind: "layer", defaultDock: true },
  { id: "hurricanes", label: "Storms", group: "overlays", kind: "layer", defaultDock: true },
  { id: "fires", label: "Fires", group: "overlays", kind: "layer", defaultDock: true },
  { id: "loop", label: "Loop", group: "overlays", kind: "action", defaultDock: true },
  { id: "alerts", label: "Alerts", group: "warnings", kind: "layer", defaultDock: true },
  { id: "tornado", label: "Tornado", group: "warnings", kind: "layer", defaultDock: true },
  { id: "severe", label: "Severe", group: "warnings", kind: "layer", defaultDock: true },
  { id: "flood", label: "Flood", group: "warnings", kind: "layer", defaultDock: true },
  { id: "winter", label: "Winter", group: "warnings", kind: "layer", defaultDock: true },
  { id: "now", label: "Now", group: "desk", kind: "route", path: "/Forecast", defaultDock: true },
  { id: "hourly", label: "Hourly", group: "desk", kind: "route", path: "/Forecast#hourly", defaultDock: true },
  { id: "daily", label: "10 Day", group: "desk", kind: "route", path: "/Forecast#daily", defaultDock: true },
  { id: "radio", label: "Radio", group: "desk", kind: "route", path: "/Radio", defaultDock: true },
  { id: "globe", label: "Globe", group: "desk", kind: "route", path: "/Globe", defaultDock: true },
  { id: "more", label: "More", group: "desk", kind: "route", path: "/More", defaultDock: true },
  { id: "settings", label: "Settings", group: "desk", kind: "route", path: "/Settings", defaultDock: true },
  { id: "contacts", label: "Contacts", group: "safety", kind: "route", path: "/Contacts", defaultDock: true },
  { id: "help", label: "Help Me", group: "safety", kind: "action", defaultDock: true },
  { id: "safe", label: "I'm Safe", group: "safety", kind: "action", defaultDock: true },
];

export const MAP_FEATURE_IDS = new Set(MAP_FEATURES.map((feature) => feature.id));
export const DEFAULT_DOCK_IDS = MAP_FEATURES.filter((feature) => feature.defaultDock).map((feature) => feature.id);
export const MAX_DOCK_CHIPS = MAP_FEATURES.length;
export const MAP_DOCK_STORAGE_KEY = "mapDesk_v2";

export function getMapFeature(id) {
  return MAP_FEATURES.find((feature) => feature.id === id);
}

export function featuresOnMap(dockIds, options = {}) {
  const safetyActions = options.safetyActions !== false;
  const order = new Map((dockIds || []).map((id, index) => [id, index]));
  return MAP_FEATURE_GROUPS.map((group) => ({
    ...group,
    features: MAP_FEATURES
      .filter((feature) => feature.group === group.id && order.has(feature.id))
      .filter((feature) => safetyActions || (feature.id !== "help" && feature.id !== "safe"))
      .sort((a, b) => order.get(a.id) - order.get(b.id)),
  })).filter((group) => group.features.length > 0);
}

export function loadDockIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(MAP_DOCK_STORAGE_KEY) || "null");
    if (!Array.isArray(parsed)) return DEFAULT_DOCK_IDS;
    const next = parsed.filter((id) => MAP_FEATURE_IDS.has(id));
    return next.length ? next.slice(0, MAX_DOCK_CHIPS) : DEFAULT_DOCK_IDS;
  } catch {
    return DEFAULT_DOCK_IDS;
  }
}

export function saveDockIds(ids) {
  const next = ids.filter((id) => MAP_FEATURE_IDS.has(id)).slice(0, MAX_DOCK_CHIPS);
  localStorage.setItem(MAP_DOCK_STORAGE_KEY, JSON.stringify(next));
  return next;
}
