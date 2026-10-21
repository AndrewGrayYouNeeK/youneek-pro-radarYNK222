import assert from "node:assert/strict";
import test from "node:test";
import {
  celsiusToFahrenheit,
  convertTemperature,
  convertWindSpeed,
  isUsCustomary,
  kmhToMph,
  weatherKitUnitsFrom,
} from "./weatherkit-units.js";

test("recognizes Apple US customary unit codes", () => {
  assert.equal(isUsCustomary("s"), true);
  assert.equal(isUsCustomary("us"), true);
  assert.equal(isUsCustomary("m"), false);
  assert.equal(isUsCustomary(undefined), false);
});

test("converts metric WeatherKit temperatures to Fahrenheit", () => {
  assert.equal(celsiusToFahrenheit(0), 32);
  assert.equal(celsiusToFahrenheit(22), 71.6);
  assert.equal(convertTemperature(22, "m"), 71.6);
  assert.equal(convertTemperature(72, "s"), 72);
});

test("converts metric WeatherKit wind from km/h to mph", () => {
  assert.ok(Math.abs(kmhToMph(16.09344) - 10) < 0.01);
  assert.equal(convertWindSpeed(10, "s"), 10);
});

test("reads units from WeatherKit metadata", () => {
  assert.equal(weatherKitUnitsFrom({ currentWeather: { metadata: { units: "s" } } }), "s");
  assert.equal(weatherKitUnitsFrom({}), "m");
});
