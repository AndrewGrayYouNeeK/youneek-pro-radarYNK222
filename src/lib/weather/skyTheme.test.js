import assert from "node:assert/strict";
import test from "node:test";
import { skyTheme, weatherIconClass } from "./skyTheme.js";

test("clear daylight uses WeatherBug sky blue, not navy or lime", () => {
  const theme = skyTheme({ weatherCode: 0, daylight: true });
  assert.equal(theme.name, "clear");
  assert.match(theme.background, /#1E7BD6|#4DA6EA|#87CEFA/i);
  assert.doesNotMatch(theme.background, /#07101c|#020617/i);
});

test("drizzle and rain use gray-blue skies", () => {
  assert.equal(skyTheme({ weatherCode: 51, daylight: true }).name, "rain");
  assert.equal(skyTheme({ weatherCode: 63, daylight: true }).name, "rain");
});

test("WeatherKit condition IDs drive WeatherBug-style scenes", () => {
  assert.equal(skyTheme({ conditionCode: "Thunderstorms", daylight: true }).name, "storm");
  assert.equal(skyTheme({ conditionCode: "HeavyRain", daylight: true }).name, "rain");
  assert.equal(skyTheme({ conditionCode: "Blizzard", daylight: true }).name, "snow");
  assert.equal(skyTheme({ conditionCode: "Clear", daylight: false }).name, "clear-night");
  assert.equal(skyTheme({ conditionCode: "PartlyCloudy", daylight: false }).name, "partly-night");
  assert.equal(skyTheme({ conditionCode: "HeavyRain", precipitationIntensity: 10 }).intensity, "heavy");
});

test("sun icons are gold, rain icons are pale blue", () => {
  assert.equal(weatherIconClass(0), "text-yellow-300");
  assert.equal(weatherIconClass(51), "text-sky-100");
});
