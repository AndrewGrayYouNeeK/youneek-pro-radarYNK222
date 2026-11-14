import assert from "node:assert/strict";
import test from "node:test";
import { demoHurricaneView, isDemoHurricane } from "./hurricaneFlag.js";
import {
  DEMO_FEATURE_ID,
  HARVEY_REFLECTIVITY_TIME,
  HARVEY_REPLAY_LABEL,
  HARVEY_VELOCITY_SCAN,
  demoHurricaneFeature,
  harveyWarningCollection,
  reflectivityWmsParams,
  stripDemoHurricaneFromCache,
  velocityWmsParams,
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

test("replay uses the Harvey landfall archive, not a drawn storm", () => {
  const reflectivity = reflectivityWmsParams();
  const velocity = velocityWmsParams();
  assert.equal(reflectivity.time, HARVEY_REFLECTIVITY_TIME);
  assert.equal(reflectivity.layers, "nexrad-n0q-wmst");
  assert.equal(velocity.prod, "N0U");
  assert.equal(velocity.sector, "CRP");
  assert.equal(velocity.time, HARVEY_VELOCITY_SCAN);
  assert.equal(HARVEY_REPLAY_LABEL.includes("replay"), true);
  assert.equal(HARVEY_REPLAY_LABEL.includes("Harvey"), true);
});

test("archived hurricane warning zones are the real VTEC zones", () => {
  const collection = harveyWarningCollection();
  assert.equal(collection.type, "FeatureCollection");
  assert.ok(collection.features.length >= 10);
  assert.ok(collection.features.some((feature) => feature.properties.wfo === "CRP" && feature.properties.event === "Hurricane Warning"));
  assert.ok(collection.features.every((feature) => feature.properties.ynkDemo === "hurricane"));
});

test("injected replay warning is stripped before the alert cache write", () => {
  const feature = demoHurricaneFeature();
  assert.equal(feature.properties.event, "Hurricane Warning");
  assert.equal(feature.properties.ynkLayer, undefined);
  assert.match(feature.properties.headline, /Harvey/);
  assert.match(feature.properties.instruction, /not a current/);
  assert.equal(feature.id, DEMO_FEATURE_ID);
  const merged = withDemoHurricaneFeature({
    type: "FeatureCollection",
    features: [{ id: "real-flood", properties: { event: "Flood Warning", ynkLayer: "flood" } }],
  });
  assert.equal(merged.features.length, 2);
  const cached = JSON.stringify({ savedAt: 1, data: merged });
  const stripped = JSON.parse(stripDemoHurricaneFromCache(cached));
  assert.equal(stripped.data.features.length, 1);
  assert.equal(stripped.data.features[0].id, "real-flood");
  const untouched = JSON.stringify({ savedAt: 1, data: { features: [{ id: "real-flood" }] } });
  assert.equal(stripDemoHurricaneFromCache(untouched), untouched);
});
