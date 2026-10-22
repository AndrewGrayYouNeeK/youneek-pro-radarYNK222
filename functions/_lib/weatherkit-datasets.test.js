import assert from "node:assert/strict";
import test from "node:test";
import {
  WEATHERKIT_STATUS_AVAILABILITY_URL,
  datasetsFromAvailability,
  selectSupportedDatasets,
  weatherKitAvailabilityUrl,
} from "./weatherkit-datasets.js";

test("availability includes weatherAlerts only when a country code is sent", () => {
  assert.equal(
    weatherKitAvailabilityUrl(37.77, -122.42, "us"),
    "https://weatherkit.apple.com/api/v1/availability/37.77/-122.42?country=US"
  );
  assert.equal(
    weatherKitAvailabilityUrl(37.77, -122.42, ""),
    "https://weatherkit.apple.com/api/v1/availability/37.77/-122.42"
  );
  assert.match(WEATHERKIT_STATUS_AVAILABILITY_URL, /country=US/);
});

test("the weather request keeps only datasets Apple lists for that location", () => {
  const available = ["currentWeather", "forecastDaily", "forecastHourly", "forecastNextHour", "weatherAlerts"];
  assert.deepEqual(
    selectSupportedDatasets(available, "currentWeather,forecastHourly,weatherAlerts,trendComparison"),
    ["currentWeather", "forecastHourly", "weatherAlerts"]
  );
});

test("without an availability answer, weatherAlerts is not guessed into the request", () => {
  assert.deepEqual(selectSupportedDatasets(null), [
    "currentWeather",
    "forecastHourly",
    "forecastDaily",
    "forecastNextHour",
  ]);
  assert.deepEqual(datasetsFromAvailability(["currentWeather", "weatherAlerts"]), [
    "currentWeather",
    "weatherAlerts",
  ]);
});
