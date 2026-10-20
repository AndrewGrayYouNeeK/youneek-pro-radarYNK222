import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_WEATHER_APP_URL,
  LANDING_PROJECT,
  WEATHER_PROJECT,
  describeSite,
  homePathForRole,
  resolveSiteRole,
  siteRoleFromEnv,
  siteRoleFromHost,
} from "./site.js";

test("hostnames map to landing vs weather vs local", () => {
  assert.equal(siteRoleFromHost("youneek-pro-radar-landing.youneekartifacts.workers.dev"), "landing");
  assert.equal(siteRoleFromHost("youneek-pro-radarynk222.youneekartifacts.workers.dev"), "weather");
  assert.equal(siteRoleFromHost("youneek-pro-radarynk222.pages.dev"), "weather");
  assert.equal(siteRoleFromHost("youneekproradarbaby.youneekartifacts.workers.dev"), "weather");
  assert.equal(siteRoleFromHost("youneekproradar.com"), "weather");
  assert.equal(siteRoleFromHost("www.youneekproradar.com"), "weather");
  assert.equal(siteRoleFromHost("127.0.0.1"), "local");
  assert.equal(siteRoleFromHost("localhost"), "local");
});

test("unknown public hosts default to the weather app, not the splash page", () => {
  assert.equal(siteRoleFromHost("radar.example.com"), "weather");
  assert.equal(homePathForRole("weather"), "/Radar");
  assert.equal(homePathForRole("landing"), "/");
  assert.equal(homePathForRole("local"), "/Radar");
});

test("API weather role wins over a custom domain so the radar is the homepage", () => {
  assert.equal(resolveSiteRole("weather", "youneekproradar.com"), "weather");
  assert.equal(resolveSiteRole("landing", "youneekproradar.com"), "landing");
  assert.equal(resolveSiteRole("local", "youneekproradar.com"), "weather");
  assert.equal(resolveSiteRole(undefined, "youneekproradar.com"), "weather");
  assert.equal(homePathForRole(resolveSiteRole("weather", "youneekproradar.com")), "/Radar");
});

test("wrangler SITE_ROLE and worker name pick the Cloudflare project", () => {
  assert.equal(siteRoleFromEnv({ SITE_ROLE: "landing" }), "landing");
  assert.equal(siteRoleFromEnv({ SITE_ROLE: "local" }), "local");
  assert.equal(siteRoleFromEnv({ WORKER_PROJECT: WEATHER_PROJECT }), "weather");
  assert.equal(siteRoleFromEnv({ WORKER_PROJECT: LANDING_PROJECT }), "landing");
  const landing = describeSite({ SITE_ROLE: "landing", WEATHER_APP_URL: "https://weather.example" });
  assert.equal(landing.project, LANDING_PROJECT);
  assert.equal(landing.weatherAppUrl, "https://weather.example");
  const weather = describeSite({ SITE_ROLE: "weather" });
  assert.equal(weather.project, WEATHER_PROJECT);
});

test("landing without WEATHER_APP_URL still points at the live weather Worker", () => {
  const landing = describeSite({ SITE_ROLE: "landing" });
  assert.equal(landing.weatherAppUrl, DEFAULT_WEATHER_APP_URL);
  const weather = describeSite({ SITE_ROLE: "weather" });
  assert.equal(weather.weatherAppUrl, "");
});
