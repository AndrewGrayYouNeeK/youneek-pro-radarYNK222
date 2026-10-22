import assert from "node:assert/strict";
import test from "node:test";
import { fetchWeatherKit, resolveCountryCode } from "./weatherkit.js";

const ENV = {
  WEATHERKIT_TEAM_ID: "TEAM",
  WEATHERKIT_KEY_ID: "KEY",
  WEATHERKIT_SERVICE_ID: "service",
  WEATHERKIT_PRIVATE_KEY: "not-used",
};

function mockFetch(handlers) {
  const calls = [];
  const fetchImpl = async (url) => {
    const href = String(url);
    calls.push(href);
    const handler = handlers.find((item) => href.includes(item.match));
    if (!handler) return { ok: false, status: 404, json: async () => ({}), text: async () => "" };
    return handler.respond(href);
  };
  return { fetchImpl, calls };
}

test("a US point requests weatherAlerts after availability lists it", async () => {
  const { fetchImpl, calls } = mockFetch([
    {
      match: "api.weather.gov/points",
      respond: async () => ({ ok: true, json: async () => ({}) }),
    },
    {
      match: "/availability/",
      respond: async () => ({
        ok: true,
        json: async () => ["currentWeather", "forecastHourly", "forecastDaily", "forecastNextHour", "weatherAlerts"],
      }),
    },
    {
      match: "/api/v1/weather/",
      respond: async () => ({ ok: true, status: 200, json: async () => ({ currentWeather: { temperature: 70 } }), text: async () => "" }),
    },
  ]);

  const data = await fetchWeatherKit(ENV, 37.77, -122.42, { token: "test-token", fetchImpl });
  assert.equal(data.currentWeather.temperature, 70);
  const weatherUrl = calls.find((url) => url.includes("/api/v1/weather/"));
  const params = new URL(weatherUrl).searchParams;
  assert.match(params.get("dataSets"), /weatherAlerts/);
  assert.equal(params.get("country"), "US");
  assert.match(calls.find((url) => url.includes("/availability/")), /country=US/);
});

test("weatherAlerts is left out when availability does not offer it", async () => {
  const { fetchImpl, calls } = mockFetch([
    {
      match: "/availability/",
      respond: async () => ({
        ok: true,
        json: async () => ["currentWeather", "forecastHourly", "forecastDaily", "forecastNextHour"],
      }),
    },
    {
      match: "/api/v1/weather/",
      respond: async () => ({ ok: true, status: 200, json: async () => ({ ok: true }), text: async () => "" }),
    },
  ]);

  await fetchWeatherKit(ENV, 48.85, 2.35, { token: "test-token", country: "FR", fetchImpl });
  const params = new URL(calls.find((url) => url.includes("/api/v1/weather/"))).searchParams;
  assert.equal(params.get("dataSets").includes("weatherAlerts"), false);
  assert.equal(params.get("country"), "FR");
  assert.equal(calls.some((url) => url.includes("weather.gov")), false);
});

test("country code falls back to reverse geocoding outside the US", async () => {
  const country = await resolveCountryCode(51.5, -0.12, "", async (url) => {
    const href = String(url);
    if (href.includes("weather.gov")) return { ok: false, status: 404 };
    return { ok: true, json: async () => ({ results: [{ country_code: "gb" }] }) };
  });
  assert.equal(country, "GB");
});
