import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { bearingToCardinal, etaLabel, stormDistanceSummary } from "./stormDistance.js";

test("storm distance summary reads as one line", () => {
  assert.equal(stormDistanceSummary({ bearing: 22, distanceMi: 12.3, speedMph: 25, etaMinutes: 30 }), "12.3 mi NNE · ~25 mph · ETA 30 min");
  assert.equal(stormDistanceSummary({ bearing: 270, distanceMi: 80, speedMph: 30, etaMinutes: 160 }), "80 mi W · ~30 mph · ETA 2.7 hr");
  assert.equal(stormDistanceSummary(null), "");
  assert.equal(bearingToCardinal(359), "N");
  assert.equal(etaLabel(0), "< 1 min");
});

test("the clean radar mounts storm distance", () => {
  const radar = readFileSync(new URL("../../components/radar/RadarDisplay.jsx", import.meta.url), "utf8");
  const clean = radar.indexOf('data-storm-distance="clean"');
  assert.ok(clean > 0);
  assert.match(radar.slice(clean, clean + 300), /<StormToolsPanel compact stormData=\{stormData\}/);
});
