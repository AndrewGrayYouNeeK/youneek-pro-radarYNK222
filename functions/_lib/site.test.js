import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_WEATHER_APP_URL, MARKETING_URL, WEATHER_PROJECT, describeSite } from "./site.js";

test("this Worker is the weather app and points marketing at youneekproradar.com", () => {
  const site = describeSite();
  assert.equal(site.role, "weather");
  assert.equal(site.project, WEATHER_PROJECT);
  assert.equal(site.weatherProject, WEATHER_PROJECT);
  assert.equal(site.marketingUrl, MARKETING_URL);
  assert.equal(site.marketingUrl, "https://youneekproradar.com");
  assert.equal(site.homePath, "/Radar");
  assert.equal(DEFAULT_WEATHER_APP_URL.includes("youneek-pro-radarynk222"), true);
});

test("WORKER_PROJECT overrides the reported project name without changing the role", () => {
  const site = describeSite({ WORKER_PROJECT: WEATHER_PROJECT });
  assert.equal(site.role, "weather");
  assert.equal(site.project, WEATHER_PROJECT);
  assert.equal(site.homePath, "/Radar");
});
