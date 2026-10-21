import assert from "node:assert/strict";
import test from "node:test";
import { nhcLayerIds } from "./nhcLayers.js";
import { advectDegrees, meteorologicalVector } from "./windField.js";
import { rainTimingLabel } from "./rainTiming.js";

test("maps an East Pacific storm number onto the NHC forecast track layer", () => {
  const layers = nhcLayerIds("EP2");
  assert.equal(layers.forecastTrack, 163);
  assert.equal(layers.cone, 164);
  assert.equal(layers.pastTrack, 168);
});

test("rejects a basin slot NHC does not publish", () => {
  assert.equal(nhcLayerIds("EP9"), null);
  assert.equal(nhcLayerIds(""), null);
});

test("turns a north wind into southward motion", () => {
  const vector = meteorologicalVector(0, 10);
  assert.ok(Math.abs(vector.east) < 0.001);
  assert.ok(vector.north < 0);
});

test("advects a point east when the wind blows from the west", () => {
  const vector = meteorologicalVector(270, 10);
  const next = advectDegrees(40, -90, vector.east, vector.north, 3600);
  assert.ok(next.lon > -90);
  assert.ok(Math.abs(next.lat - 40) < 0.01);
});

test("describes when the next wet minute arrives", () => {
  const now = Date.parse("2026-10-21T12:00:00Z");
  assert.equal(rainTimingLabel([], now), "Minute precipitation unavailable");
  assert.equal(
    rainTimingLabel([{ time: "2026-10-21T12:00:00Z", intensity: 0, chance: 0 }], now),
    "No rain in the next hour"
  );
  assert.equal(
    rainTimingLabel([{ time: "2026-10-21T12:12:00Z", intensity: 0.2, chance: 80 }], now),
    "Rain starts in 12 min"
  );
});
