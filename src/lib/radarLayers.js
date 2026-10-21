const KEY = "radarLayers_v1";

export const RADAR_LAYERS_EVENT = "ynk-radar-layers";

export const DEFAULT_RADAR_LAYERS = {
  radar: true,
  satellite: false,
  temps: false,
  clouds: false,
  precip: false,
  wind: false,
  lightning: true,
  storms: true,
  cells: true,
  fires: false,
  alertTornado: true,
  alertSevere: true,
  alertFlood: false,
  alertWinter: false,
  alertHeat: false,
  alertWind: false,
  alertFire: false,
};

export function loadRadarLayers() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!parsed || typeof parsed !== "object") return { ...DEFAULT_RADAR_LAYERS };
    return { ...DEFAULT_RADAR_LAYERS, ...parsed };
  } catch {
    return { ...DEFAULT_RADAR_LAYERS };
  }
}

export function saveRadarLayers(partial) {
  const next = { ...loadRadarLayers(), ...partial };
  localStorage.setItem(KEY, JSON.stringify(next));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(RADAR_LAYERS_EVENT, { detail: next }));
  }
  return next;
}
