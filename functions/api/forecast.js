import { requireLatLon, proxyJson } from "../_lib/http.js";

export async function onRequestGet(context) {
  const coords = requireLatLon(context.request);
  if (coords.error) return coords.error;

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(coords.lat));
  url.searchParams.set("longitude", String(coords.lon));
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("wind_speed_unit", "mph");
  url.searchParams.set("precipitation_unit", "inch");
  url.searchParams.set("forecast_days", "16");
  url.searchParams.set("past_days", "1");
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "dew_point_2m",
      "precipitation",
      "weather_code",
      "cloud_cover",
      "pressure_msl",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
      "visibility",
      "is_day",
    ].join(",")
  );
  url.searchParams.set(
    "hourly",
    [
      "temperature_2m",
      "precipitation_probability",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
      "snowfall",
      "snow_depth",
      "uv_index",
      "relative_humidity_2m",
      "pressure_msl",
      "cloud_cover",
    ].join(",")
  );
  url.searchParams.set(
    "daily",
    [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "precipitation_sum",
      "snowfall_sum",
      "sunrise",
      "sunset",
      "uv_index_max",
    ].join(",")
  );
  url.searchParams.set("minutely_15", "precipitation,precipitation_probability");
  url.searchParams.set("forecast_minutely_15", "8");

  return proxyJson(url, { headers: { Accept: "application/json" } }, 180);
}
