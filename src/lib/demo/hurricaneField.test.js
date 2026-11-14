import assert from "node:assert/strict";
import test from "node:test";
import { demoHurricaneView, isDemoHurricane } from "./hurricaneFlag.js";
import {
  DEMO_FEATURE_ID,
  STORM_CENTER,
  demoHurricaneFeature,
  offsetKm,
  radialVelocityMs,
  reflectivityDbz,
  stripDemoHurricaneFromCache,
  warningContains,
  withDemoHurricaneFeature,
} from "./hurricaneField.js";

test("demo hurricane stays off unless the URL flag is exactly hurricane", () => {
  assert.equal(isDemoHurricane(""), false);
  assert.equal(isDemoHurricane("?"), false);
  assert.equal(isDemoHurricane("?demo=tornado"), false);
  assert.equal(isDemoHurricane("?demo="), false);
  assert.equal(isDemoHurricane("?hurricane=1"), false);
  assert.equal(isDemoHurricane("?demo=hurricane2"), false);
  assert.equal(isDemoHurricane("?demo=hurricane"), true);
  assert.equal(isDemoHurricane("?demo=Hurricane&x=1"), true);
  assert.equal(demoHurricaneView(""), null);
  assert.equal(demoHurricaneView("?demo=hurricane"), "overview");
  assert.equal(demoHurricaneView("?demo=hurricane&demoView=eye"), "eye");
  assert.equal(demoHurricaneView("?demo=hurricane&demoView=velocity"), "velocity");
  assert.equal(demoHurricaneView("?demoView=velocity"), null);
});

test("category 4 field has a clear eye, a violent eyewall, and no echo far away", () => {
  assert.equal(reflectivityDbz(STORM_CENTER.lat, STORM_CENTER.lon), 0);
  const eyewall = offsetKm(STORM_CENTER.lat, STORM_CENTER.lon, 42, 0);
  assert.ok(reflectivityDbz(eyewall.lat, eyewall.lon) > 55);
  assert.equal(reflectivityDbz(40, -100), 0);
});

test("eyewall velocity couplet changes sign across the line of sight", () => {
  const east = offsetKm(STORM_CENTER.lat, STORM_CENTER.lon, 42, 8);
  const west = offsetKm(STORM_CENTER.lat, STORM_CENTER.lon, -42, -8);
  const inbound = radialVelocityMs(west.lat, west.lon);
  const outbound = radialVelocityMs(east.lat, east.lon);
  assert.ok(Math.abs(inbound) > 15, `west radial ${inbound}`);
  assert.ok(Math.abs(outbound) > 15, `east radial ${outbound}`);
  assert.ok(inbound * outbound < 0, `expected a couplet, got ${inbound} and ${outbound}`);
});

test("hurricane warning covers the upper Texas coast and not the offshore eye", () => {
  assert.equal(warningContains(29.3, -94.8), true);
  assert.equal(warningContains(STORM_CENTER.lat, STORM_CENTER.lon), false);
});

test("injected warning is a hurricane feature and is stripped before alert cache writes", () => {
  const feature = demoHurricaneFeature();
  assert.equal(feature.properties.event, "Hurricane Warning");
  assert.equal(feature.properties.ynkLayer, undefined);
  assert.equal(feature.id, DEMO_FEATURE_ID);
  const merged = withDemoHurricaneFeature({
    type: "FeatureCollection",
    features: [{ id: "real-flood", properties: { event: "Flood Warning", ynkLayer: "flood" } }],
  });
  assert.equal(merged.features.length, 2);
  assert.equal(merged.features[0].id, "real-flood");
  const cached = JSON.stringify({
    savedAt: 1,
    data: merged,
  });
  const stripped = JSON.parse(stripDemoHurricaneFromCache(cached));
  assert.equal(stripped.data.features.length, 1);
  assert.equal(stripped.data.features[0].id, "real-flood");
  const untouched = JSON.stringify({ savedAt: 1, data: { features: [{ id: "real-flood" }] } });
  assert.equal(stripDemoHurricaneFromCache(untouched), untouched);
});
