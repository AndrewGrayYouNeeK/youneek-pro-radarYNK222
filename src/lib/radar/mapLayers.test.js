import assert from "node:assert/strict";
import test from "node:test";
import { holdGpsLocation, showWeatherSkeleton, weatherQueryCoords } from "../locationStability.js";
import { buildRadarLoop, opacitiesForIndex, syncFrameLayers } from "./loopFrames.js";
import { ridgeProductLabel, ridgeTileUrl } from "./ridgeTiles.js";

test("a small GPS move keeps the forecast and hides the skeleton", () => {
  const previous = { lat: 36.154, lon: -95.9928, accuracy: 30, source: "gps", label: "Tulsa, OK" };
  const fix = { lat: 36.156, lon: -95.99, accuracy: 12 };
  const held = holdGpsLocation(previous, fix);
  assert.equal(held.lat, previous.lat);
  assert.equal(held.lon, previous.lon);
  assert.equal(held.accuracy, 12);
  assert.deepEqual(weatherQueryCoords(held.lat, held.lon), weatherQueryCoords(previous.lat, previous.lon));
  assert.equal(showWeatherSkeleton({ hasData: true, isLoading: true, locationLoading: true }), false);
  assert.equal(showWeatherSkeleton({ hasData: false, isLoading: true, locationLoading: false }), true);
});

test("a move past 0.3 miles is a new location", () => {
  const previous = { lat: 36.15, lon: -95.99, accuracy: 20, source: "gps" };
  const fix = { lat: 36.7, lon: -95.99, accuracy: 18 };
  assert.equal(holdGpsLocation(previous, fix), null);
});

test("builds a per-station Iowa Mesonet velocity tile URL", () => {
  const velocity = ridgeTileUrl("ktlx", "velocity");
  const relative = ridgeTileUrl("KINX", "stormRelative");
  assert.equal(
    velocity,
    "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::KTLX-N0U-0/{z}/{x}/{y}.png"
  );
  assert.match(relative, /ridge::KINX-N0S-0/);
  assert.equal(velocity.includes("nexrad-n0u-900913"), false);
  assert.equal(ridgeProductLabel("KINX", "velocity"), "Showing KINX N0U");
});

test("does not rebuild radar layers when only the frame index changes", () => {
  const frames = [
    { tileUrl: "https://tiles.example/a/{z}/{x}/{y}.png" },
    { tileUrl: "https://tiles.example/b/{z}/{x}/{y}.png" },
  ];
  const created = syncFrameLayers([], frames);
  assert.equal(created.rebuilt, true);
  const again = syncFrameLayers(created.layers, frames);
  assert.equal(again.rebuilt, false);
  assert.deepEqual(again.layers.map((layer) => layer.tileUrl), frames.map((frame) => frame.tileUrl));
  const shown = opacitiesForIndex(again.layers, 1);
  assert.deepEqual(shown.map((layer) => layer.tileUrl), frames.map((frame) => frame.tileUrl));
  assert.deepEqual(shown.map((layer) => layer.opacity), [0, 0.8]);
});

test("fills an empty RainViewer nowcast with an estimated future loop", () => {
  const past = [
    { time: 1000, tileUrl: "https://tiles.example/1.png" },
    { time: 1600, tileUrl: "https://tiles.example/2.png" },
  ];
  const loop = buildRadarLoop(past, [], { includeFuture: true });
  assert.equal(loop.source, "extrapolated-recent-frames");
  assert.equal(loop.frames.at(-1).extrapolated, true);
  assert.equal(loop.frames.at(-1).kind, "future");
  assert.equal(loop.frames.at(-1).tileUrl, "https://tiles.example/2.png");
});
