import assert from "node:assert/strict";
import test from "node:test";
import {
  GET_APP_URL,
  PREMIUM_LAYER_KEYS,
  PREMIUM_UNLOCKED,
  isFreeFloodFeature,
  isLayerLocked,
  isPathFree,
  isPremiumUnlocked,
  isProductLocked,
  radarProductFor,
} from "./premium.js";

test("only the native app unlocks premium", () => {
  assert.equal(isPremiumUnlocked(true), true);
  assert.equal(isPremiumUnlocked(false), false);
  assert.equal(isPremiumUnlocked(undefined), false);
  // node is not a Capacitor native platform
  assert.equal(PREMIUM_UNLOCKED, false);
  assert.equal(GET_APP_URL, "https://youneekproradar.com");
});

test("web preview is reflectivity only; the app keeps velocity products", () => {
  assert.equal(radarProductFor("velocity", false), "reflectivity");
  assert.equal(radarProductFor("stormRelative", false), "reflectivity");
  assert.equal(radarProductFor("reflectivity", false), "reflectivity");
  assert.equal(radarProductFor(undefined, false), "reflectivity");
  assert.equal(radarProductFor("velocity", true), "velocity");
  assert.equal(radarProductFor("stormRelative", true), "stormRelative");
  assert.equal(isProductLocked("velocity", false), true);
  assert.equal(isProductLocked("velocity", true), false);
  assert.equal(isProductLocked("reflectivity", false), false);
});

test("web free tier is warnings only; the app unlocks every layer", () => {
  for (const key of ["radar", "tornado", "severe", "tornadoWatch", "severeWatch", "flood"]) {
    assert.equal(isLayerLocked(key, false), false, key);
    assert.equal(PREMIUM_LAYER_KEYS.includes(key), false, key);
  }
  for (const key of [
    "future", "station", "satellite", "surface", "wind", "precip", "stormReports", "cells", "hurricanes",
    "fires", "perimeters", "snow", "air", "quakes", "fronts", "spc1", "spc2", "spc3", "md",
    "winter", "heat", "windAlert", "fireWx", "anythingNew",
  ]) {
    assert.equal(isLayerLocked(key, false), true, key);
    assert.equal(isLayerLocked(key, true), false, key);
  }
});

test("web pages: only Radar and Privacy are free; the app opens every page", () => {
  for (const path of ["/Radar", "/radar", "/Radar/", "/Privacy"]) assert.equal(isPathFree(path, false), true, path);
  for (const path of ["/", "/Hourly", "/Daily", "/Forecast", "/More", "/Settings", "/Radio", "/Contacts", "/Lightning", "/Hurricanes", "/Briefing", "/Globe", "/Intercept", "/MapLayers"]) {
    assert.equal(isPathFree(path, false), false, path);
    assert.equal(isPathFree(path, true), true, path);
  }
});

test("web flood outlines are warnings only", () => {
  const f = (event) => ({ properties: { event } });
  assert.equal(isFreeFloodFeature(f("Flash Flood Warning")), true);
  assert.equal(isFreeFloodFeature(f("Flood Warning")), true);
  assert.equal(isFreeFloodFeature(f("Flood Watch")), false);
  assert.equal(isFreeFloodFeature(f("Flash Flood Watch")), false);
  assert.equal(isFreeFloodFeature(f("Flood Advisory")), false);
});
