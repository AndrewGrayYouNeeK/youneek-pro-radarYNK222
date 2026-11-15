import assert from "node:assert/strict";
import test from "node:test";
import { GIBS_VISIBLE_LAG_MS, gibsVisibleFrames } from "./satelliteTiles.js";

const NOW = Date.parse("2026-11-14T23:40:00Z");

test("visible satellite frames skip the current UTC hour that GIBS has not published", () => {
  const frames = gibsVisibleFrames(new Date(NOW), 4);
  const stamps = frames.map((frame) => frame.tileUrl.match(/default\/([^/]+)\//)[1]);
  assert.deepEqual(stamps, [
    "2026-11-14T19:00:00Z",
    "2026-11-14T20:00:00Z",
    "2026-11-14T21:00:00Z",
    "2026-11-14T22:00:00Z",
  ]);
  assert.equal(GIBS_VISIBLE_LAG_MS, 60 * 60 * 1000);
  assert.ok(frames.every((frame) => frame.tileUrl.includes("GoogleMapsCompatible_Level7")));
});
