import {
  DEFAULT_DOCK_IDS,
  MAP_DOCK_STORAGE_KEY,
  MAP_FEATURES,
  MAX_DOCK_CHIPS,
  featuresOnMap,
  getMapFeature,
  loadDockIds,
  saveDockIds,
} from "../src/lib/mapDesk.js";

const store = new Map();
globalThis.localStorage = {
  getItem(key) {
    return store.has(key) ? store.get(key) : null;
  },
  setItem(key, value) {
    store.set(key, String(value));
  },
  removeItem(key) {
    store.delete(key);
  },
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(getMapFeature("hourly")?.path === "/Forecast#hourly", "Hourly should open from the radar");
assert(getMapFeature("daily")?.path === "/Forecast#daily", "10 Day should open from the radar");
assert(getMapFeature("radio")?.path === "/Radio", "Radio should open from the radar");
assert(getMapFeature("settings")?.path === "/Settings", "Settings should be on the radar");
assert(getMapFeature("help")?.kind === "action", "Help Me should be a radar action");
assert(getMapFeature("fires")?.kind === "layer", "Fires should stay a radar layer");
assert(DEFAULT_DOCK_IDS.length === MAP_FEATURES.length, "Every pro feature should show on the radar by default");
assert(MAX_DOCK_CHIPS === MAP_FEATURES.length, "The radar can hold the full pro desk");

const groups = featuresOnMap(DEFAULT_DOCK_IDS);
assert(groups.map((group) => group.id).join(",") === "overlays,warnings,desk,safety", "Radar tools should stay in labeled groups");
assert(
  groups.find((group) => group.id === "desk").features.map((feature) => feature.id).join(",") ===
    "now,hourly,daily,radio,globe,more,settings",
  "Desk tools should be on the radar"
);
assert(
  featuresOnMap(DEFAULT_DOCK_IDS, { safetyActions: false }).every(
    (group) => group.id !== "safety" || group.features.every((feature) => feature.id !== "help" && feature.id !== "safe")
  ),
  "Help Me and I'm Safe hide when there is no local emergency"
);

const saved = saveDockIds(["hourly", "help", "bogus", "radar"]);
assert(JSON.stringify(saved) === JSON.stringify(["hourly", "help", "radar"]), "Unknown tools should be dropped");
assert(JSON.parse(localStorage.getItem(MAP_DOCK_STORAGE_KEY)).length === 3, "Radar layout should persist");
assert(JSON.stringify(loadDockIds()) === JSON.stringify(["hourly", "help", "radar"]), "Custom radar layout should reload");

const routes = MAP_FEATURES.filter((feature) => feature.kind === "route").map((feature) => feature.path);
for (const path of ["/Forecast", "/Forecast#hourly", "/Forecast#daily", "/Radio", "/Globe", "/More", "/Settings", "/Contacts"]) {
  assert(routes.includes(path), `${path} should be organized on the radar`);
}

console.log("map desk tests passed");
