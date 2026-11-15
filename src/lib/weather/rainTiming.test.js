import assert from "node:assert/strict";
import test from "node:test";
import { LIGHT_RAIN_IN_PER_HR, isWetMinute, rainArrivalFromForecast, rainTimingLabel } from "./rainTiming.js";

const now = Date.parse("2026-11-15T12:00:00Z");
const at = (min, intensity, chance = 0) => ({ time: new Date(now + min * 60000).toISOString(), intensity, chance });

test("light rain (0.01–0.05 in/hr) counts as rain", () => {
  assert.equal(LIGHT_RAIN_IN_PER_HR, 0.01);
  assert.equal(isWetMinute({ intensity: 0.02 }), true);
  assert.equal(isWetMinute({ intensity: 0.01 }), true);
  assert.equal(isWetMinute({ intensity: 0.005 }), false);
  assert.equal(isWetMinute({ intensity: 0, chance: 50 }), true);
});

test("rain timing picks up light rain arriving in 12 minutes", () => {
  const minutes = [at(0, 0), at(6, 0.004), at(12, 0.02), at(18, 0.03)];
  assert.equal(rainTimingLabel(minutes, now), "Rain starts in 12 min");
  assert.deepEqual(rainArrivalFromForecast({ openMeteoMinutes: minutes, now }), { status: "rain_soon", minutesUntilRain: 12 });
});
