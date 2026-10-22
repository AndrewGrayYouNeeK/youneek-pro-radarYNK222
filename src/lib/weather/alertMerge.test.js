import assert from "node:assert/strict";
import test from "node:test";
import { mergeWeatherAlerts } from "./alertMerge.js";
import { activeSafetyAlerts } from "../safety/weatherEmergency.js";
import { adaptWeatherKitAlerts, adaptWeatherKitDetails } from "./weatherkit-adapters.js";

test("Apple and NWS copies of the same warning become one alert with both sources", () => {
  const merged = mergeWeatherAlerts(
    [{ id: "nws-1", name: "Tornado Warning", source: "NWS", severity: "Extreme", expires: "2026-04-01T18:00:00Z" }],
    [{ id: "apple-1", name: "Tornado Warning", source: "National Weather Service", severity: "extreme", description: "Take shelter." }]
  );
  assert.equal(merged.length, 1);
  assert.equal(merged[0].source, "NWS · Apple Weather");
  assert.equal(merged[0].description, "Take shelter.");
  assert.equal(activeSafetyAlerts(merged, Date.parse("2026-04-01T12:00:00Z")).length, 1);
});

test("an Apple-only severe alert still reaches the safety trigger", () => {
  const apple = adaptWeatherKitAlerts({
    weatherAlerts: {
      alerts: [
        {
          id: "wk-1",
          phenomenon: "FlashFlood",
          significance: "Warning",
          severity: "severe",
          source: "National Weather Service",
          expireTime: "2026-04-01T18:00:00Z",
          description: "Flash flooding is occurring.",
        },
      ],
    },
  });
  assert.equal(apple[0].name, "Flash Flood Warning");
  assert.equal(apple[0].source, "National Weather Service");
  const merged = mergeWeatherAlerts([], apple);
  assert.equal(merged[0].source, "Apple Weather · National Weather Service");
  assert.equal(activeSafetyAlerts(merged, Date.parse("2026-04-01T12:00:00Z"))[0].name, "Flash Flood Warning");
});

test("WeatherKit details keep the fields the summary card does not show", () => {
  const details = adaptWeatherKitDetails({
    currentWeather: {
      metadata: { units: "m", attributionURL: "https://weatherkit.apple.com/legal-attribution.html" },
      temperatureDewPoint: 10,
      visibility: 16093.44,
      pressure: 1013,
      pressureTrend: "rising",
      uvIndex: 6,
      windGust: 32,
      cloudCover: 0.4,
      cloudCoverLowAltPct: 0.2,
      cloudCoverMidAltPct: 0.1,
      cloudCoverHighAltPct: 0.05,
      precipitationIntensity: 2.54,
    },
    forecastDaily: {
      days: [
        {
          sunrise: "2026-04-01T13:00:00Z",
          sunset: "2026-04-01T01:00:00Z",
          solarNoon: "2026-04-01T19:00:00Z",
          moonPhase: "waxingCrescent",
          moonrise: "2026-04-01T14:00:00Z",
          moonset: "2026-04-01T03:00:00Z",
          precipitationType: "rain",
          snowfallAmount: 25.4,
          daytimeForecast: { conditionCode: "Rain", precipitationChance: 0.8, temperatureMax: 18 },
          overnightForecast: { conditionCode: "MostlyClear", precipitationChance: 0.1, temperatureMin: 7 },
        },
      ],
    },
  });

  assert.equal(details.attributionUrl, "https://weatherkit.apple.com/legal-attribution.html");
  assert.equal(details.dewPoint, 50);
  assert.ok(Math.abs(details.visibilityMi - 10) < 0.05);
  assert.equal(details.pressureTrend, "rising");
  assert.equal(details.cloudLow, 20);
  assert.equal(details.cloudMid, 10);
  assert.equal(details.cloudHigh, 5);
  assert.equal(details.precipType, "Rain");
  assert.ok(Math.abs(details.snowfallIn - 1) < 0.01);
  assert.equal(details.moonPhase, "Waxing crescent");
  assert.equal(details.daytime.label, "Rain");
  assert.equal(details.daytime.high, 64.4);
  assert.equal(details.overnight.label, "Mostly Clear");
});
