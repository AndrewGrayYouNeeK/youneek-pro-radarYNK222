import assert from "node:assert/strict";
import test from "node:test";
import {
  GET_APP_URL,
  PREMIUM_LAYER_KEYS,
  PREMIUM_UNLOCKED,
  isLayerLocked,
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

test("tornado and severe warnings and watches stay free on the web", () => {
  for (const key of ["tornado", "severe", "tornadoWatch", "severeWatch"]) {
    assert.equal(isLayerLocked(key, false), false, key);
    assert.equal(PREMIUM_LAYER_KEYS.includes(key), false, key);
  }
  for (const key of ["future", "cells", "stormReports", "md", "flood", "winter", "heat", "windAlert", "fireWx"]) {
    assert.equal(isLayerLocked(key, false), true, key);
    assert.equal(isLayerLocked(key, true), false, key);
  }
});
