import { isLocalHost, weatherHref, weatherRedirect, WEATHER_APP_ORIGIN } from "../src/lib/weatherApp.js";

if (isLocalHost("localhost") !== true) throw new Error("localhost should be local");
if (isLocalHost("youneek-pro-radarynk222.youneekartifacts.workers.dev") !== false) {
  throw new Error("YNK222 host is production landing");
}

if (weatherHref("/Radar", "localhost") !== "/Radar") throw new Error("local Radar stays in-app");
if (weatherHref("/", "localhost") !== "/app") throw new Error("local Launch should stay in-app via /app");
if (weatherHref("/", "youneek-pro-radarynk222.youneekartifacts.workers.dev") !== `${WEATHER_APP_ORIGIN}/`) {
  throw new Error("Launch should open youneekproradar.com NOW");
}
if (weatherHref("/app", "youneek-pro-radarynk222.youneekartifacts.workers.dev") !== `${WEATHER_APP_ORIGIN}/`) {
  throw new Error("/app should open youneekproradar.com NOW");
}
if (weatherHref("/Forecast", "youneek-pro-radarynk222.youneekartifacts.workers.dev") !== `${WEATHER_APP_ORIGIN}/Forecast`) {
  throw new Error("Forecast should open the weather app");
}

if (weatherRedirect("/app") !== `${WEATHER_APP_ORIGIN}/`) throw new Error("/app redirect");
if (weatherRedirect("/Radar") !== `${WEATHER_APP_ORIGIN}/Radar`) throw new Error("/Radar redirect");
if (weatherRedirect("/") !== null) throw new Error("landing / must not redirect");

console.log("weather app link tests passed");
