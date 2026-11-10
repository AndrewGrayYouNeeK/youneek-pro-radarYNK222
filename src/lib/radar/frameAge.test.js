import assert from "node:assert/strict";
import test from "node:test";
import { formatRadarFrameAge, latestRadarFrameUnix, resetRadarFrameAgeCache } from "./frameAge.js";

const NOW = Date.parse("2026-11-10T15:00:00Z");

test("radar frame age stays short enough for the status line", () => {
  assert.equal(formatRadarFrameAge(NOW / 1000 - 20, NOW), "Updated just now");
  assert.equal(formatRadarFrameAge(NOW / 1000 - 4 * 60, NOW), "Updated 4 min ago");
  assert.equal(formatRadarFrameAge(NOW / 1000 + 10 * 60, NOW), "Forecast · in 10 min");
  assert.equal(formatRadarFrameAge(null, NOW), "");
});

test("the latest RainViewer past frame is cached", async () => {
  resetRadarFrameAgeCache();
  let calls = 0;
  const fetchImpl = async () => {
    calls += 1;
    return {
      ok: true,
      json: async () => ({ radar: { past: [{ time: 100 }, { time: 250 }] } }),
    };
  };
  assert.equal(await latestRadarFrameUnix(fetchImpl, NOW), 250);
  assert.equal(await latestRadarFrameUnix(fetchImpl, NOW + 1000), 250);
  assert.equal(calls, 1);
  resetRadarFrameAgeCache();
});
