import assert from "node:assert/strict";
import test from "node:test";
import { activeSafetyAlerts, shouldShowSafetyTexts } from "./weatherEmergency.js";
import { SAFETY_PREVIEW_KEY, previewSafetyAlert, readSafetyPreview } from "./safetyPreview.js";

function memoryStorage(seed = {}) {
  const data = { ...seed };
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    setItem(key, value) {
      data[key] = String(value);
    },
    removeItem(key) {
      delete data[key];
    },
  };
}

const NOW = Date.parse("2026-04-01T12:00:00Z");

test("an active warning covering the point shows safety texts", () => {
  const alerts = [
    { name: "Tornado Warning", expires: "2026-04-01T13:00:00Z" },
    { name: "Severe Thunderstorm Warning", expires: "2026-04-01T14:00:00Z" },
    { name: "Flash Flood Warning", expires: "2026-04-01T15:00:00Z" },
    { name: "Hurricane Warning", severity: "Extreme", expires: "2026-04-01T18:00:00Z" },
    { name: "Blizzard Warning", expires: "2026-04-01T20:00:00Z" },
  ];
  assert.equal(shouldShowSafetyTexts(alerts, NOW), true);
  assert.equal(activeSafetyAlerts(alerts, NOW).length, 5);
});

test("watches, advisories, and ended warnings hide safety texts", () => {
  const hidden = [
    { name: "Tornado Watch", severity: "Extreme", expires: "2026-04-01T18:00:00Z" },
    { name: "Severe Thunderstorm Watch", expires: "2026-04-01T18:00:00Z" },
    { name: "Wind Advisory", expires: "2026-04-01T18:00:00Z" },
    { name: "Special Weather Statement", severity: "Severe", expires: "2026-04-01T18:00:00Z" },
    { name: "Hazardous Weather Outlook", expires: "2026-04-01T18:00:00Z" },
    { name: "Tornado Warning", recent: true, expires: "2026-04-01T10:00:00Z" },
    { name: "Flash Flood Warning", expires: "2026-04-01T11:00:00Z" },
    { name: "Beach Hazard", severity: "Moderate" },
  ];
  assert.equal(shouldShowSafetyTexts(hidden, NOW), false);
  assert.deepEqual(activeSafetyAlerts(hidden, NOW), []);
});

test("a WeatherKit severe alert can show safety texts when it is not a watch", () => {
  assert.equal(
    shouldShowSafetyTexts([{ name: "Severe Weather", severity: "Severe", source: "Apple Weather" }], NOW),
    true
  );
});

test("safetyPreview simulates an active warning and off clears it", () => {
  const store = memoryStorage();
  const preview = readSafetyPreview("?safetyPreview=Tornado%20Warning", store, NOW);
  assert.equal(preview.name, "Tornado Warning");
  assert.equal(shouldShowSafetyTexts([preview], NOW), true);
  assert.equal(store.getItem(SAFETY_PREVIEW_KEY), "Tornado Warning");

  const remembered = readSafetyPreview("", store, NOW);
  assert.equal(remembered.name, "Tornado Warning");

  assert.equal(readSafetyPreview("?safetyPreview=0", store, NOW), null);
  assert.equal(store.getItem(SAFETY_PREVIEW_KEY), null);
  assert.equal(previewSafetyAlert("").name, "Tornado Warning");
});
