import assert from "node:assert/strict";
import test from "node:test";
import { filterUpcomingDays } from "./days.js";
import { rainArrivalFromForecast } from "./rainTiming.js";
import { stripSpcHeader } from "./spcText.js";
import { adaptWeatherKitCurrent } from "./weatherkit-adapters.js";

test("drops forecast days before today", () => {
  const now = new Date(2026, 9, 22, 15, 0, 0);
  const upcoming = filterUpcomingDays(
    [
      { date: "2026-10-21" },
      { date: "2026-10-21T23:00:00Z" },
      { date: "2026-10-22T05:00:00Z" },
      { date: "2026-10-23" },
    ],
    now
  );
  assert.deepEqual(
    upcoming.map((day) => day.date),
    ["2026-10-22T05:00:00Z", "2026-10-23"]
  );
});

test("converts WeatherKit daily high and low into Fahrenheit", () => {
  const metric = adaptWeatherKitCurrent({
    currentWeather: { temperature: 25, metadata: { units: "m" } },
    forecastDaily: {
      days: [
        { forecastStart: "2000-01-01T00:00:00Z", temperatureMax: 0, temperatureMin: 0 },
        { forecastStart: "2099-01-01T00:00:00Z", temperatureMax: 26, temperatureMin: 11 },
      ],
    },
  });
  assert.equal(Math.round(metric.daily.temperature_2m_max[0]), 79);
  assert.equal(Math.round(metric.daily.temperature_2m_min[0]), 52);

  const customary = adaptWeatherKitCurrent({
    currentWeather: { temperature: 70, metadata: { units: "s" } },
    forecastDaily: {
      days: [{ forecastStart: "2099-01-01T00:00:00Z", temperatureMax: 78, temperatureMin: 51 }],
    },
  });
  assert.equal(customary.daily.temperature_2m_max[0], 78);
  assert.equal(customary.daily.temperature_2m_min[0], 51);
});

test("uses Open-Meteo for rain timing and WeatherKit only inside that window", () => {
  const now = Date.parse("2026-10-22T18:00:00Z");
  const openMeteoMinutes = [{ time: "2026-10-22T18:15:00Z", intensity: 0.2, chance: 10 }];
  const weatherKitMinutes = [
    { time: "2026-10-22T18:04:00Z", intensity: 0, chance: 10 },
    { time: "2026-10-22T18:19:00Z", intensity: 0.2, chance: 80 },
  ];
  assert.deepEqual(rainArrivalFromForecast({ openMeteoMinutes, weatherKitMinutes, now }), {
    status: "rain_soon",
    minutesUntilRain: 19,
  });
  assert.deepEqual(
    rainArrivalFromForecast({
      openMeteoMinutes: [{ time: "2026-10-22T18:15:00Z", intensity: 0, chance: 20 }],
      weatherKitMinutes: [{ time: "2026-10-22T18:05:00Z", intensity: 1, chance: 90 }],
      now,
    }),
    { status: "dry", minutesUntilRain: null }
  );
});

test("strips SPC routing headers before the discussion", () => {
  const text = stripSpcHeader("ZCZC\nWWUS40 KWNS 221200\nDAY1\nSPC AC 221200\nA slight risk of severe storms.\nNNNN");
  assert.equal(text, "A slight risk of severe storms.");
});
