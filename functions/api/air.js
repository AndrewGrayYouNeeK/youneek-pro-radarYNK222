import { requireLatLon, proxyJson } from "../_lib/http.js";

export async function onRequestGet(context) {
  const coords = requireLatLon(context.request);
  if (coords.error) return coords.error;

  const url = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
  url.searchParams.set("latitude", String(coords.lat));
  url.searchParams.set("longitude", String(coords.lon));
  url.searchParams.set("timezone", "auto");
  url.searchParams.set(
    "current",
    [
      "us_aqi",
      "pm2_5",
      "pm10",
      "ozone",
      "nitrogen_dioxide",
      "carbon_monoxide",
      "uv_index",
      "alder_pollen",
      "birch_pollen",
      "grass_pollen",
      "mugwort_pollen",
      "olive_pollen",
      "ragweed_pollen",
    ].join(",")
  );

  return proxyJson(url, { headers: { Accept: "application/json" } }, 300);
}
