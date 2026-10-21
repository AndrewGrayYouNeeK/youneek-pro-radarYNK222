import assert from "node:assert/strict";
import test from "node:test";
import {
  EMERGENCY_STORAGE_KEY,
  RECENT_EMERGENCY_MS,
  isWeatherEmergency,
  resolveEmergencyState,
} from "./weatherEmergency.js";

function memoryStorage(seed = {}) {
  const data = { ...seed };
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    setItem(key, value) {
      data[key] = String(value);
    },
  };
}

test("warnings and severe watches count as weather emergencies", () => {
  assert.equal(isWeatherEmergency({ name: "Tornado Warning" }), true);
  assert.equal(isWeatherEmergency({ name: "Flash Flood Warning" }), true);
  assert.equal(isWeatherEmergency({ name: "Tornado Watch" }), true);
  assert.equal(isWeatherEmergency({ name: "Severe Thunderstorm Watch" }), true);
  assert.equal(isWeatherEmergency({ name: "Hurricane Warning", severity: "Extreme" }), true);
  assert.equal(isWeatherEmergency({ name: "Special Weather Statement" }), false);
  assert.equal(isWeatherEmergency({ name: "Wind Advisory" }), false);
  assert.equal(isWeatherEmergency({ name: "Air Quality Alert", severity: "Moderate" }), false);
  assert.equal(isWeatherEmergency({ name: "Flood", severity: "Severe" }), true);
});

test("safety actions stay visible during an active local emergency", () => {
  const store = memoryStorage();
  const state = resolveEmergencyState(
    [{ id: "1", name: "Tornado Warning", expires: "2099-01-01T00:00:00Z" }],
    Date.parse("2026-04-01T12:00:00Z"),
    store
  );
  assert.equal(state.visible, true);
  assert.equal(state.active, true);
  assert.equal(state.recent, false);
  assert.match(store.getItem(EMERGENCY_STORAGE_KEY), /Tornado Warning/);
});

test("safety actions stay visible after a recent local emergency expires", () => {
  const now = Date.parse("2026-04-01T18:00:00Z");
  const expired = new Date(now - 2 * 60 * 60 * 1000).toISOString();
  const store = memoryStorage();
  resolveEmergencyState([{ id: "2", name: "Severe Thunderstorm Warning", expires: expired }], now - 2 * 60 * 60 * 1000, store);

  const later = resolveEmergencyState([], now, store);
  assert.equal(later.visible, true);
  assert.equal(later.active, false);
  assert.equal(later.recent, true);
  assert.equal(later.alerts[0].name, "Severe Thunderstorm Warning");
});

test("safety actions hide once the recent emergency window has passed", () => {
  const now = Date.parse("2026-04-01T18:00:00Z");
  const store = memoryStorage({
    [EMERGENCY_STORAGE_KEY]: JSON.stringify({
      savedAt: now - RECENT_EMERGENCY_MS - 1000,
      until: now - 1000,
      alerts: [{ name: "Tornado Warning" }],
    }),
  });
  const state = resolveEmergencyState([], now, store);
  assert.equal(state.visible, false);
  assert.equal(state.recent, false);
});
