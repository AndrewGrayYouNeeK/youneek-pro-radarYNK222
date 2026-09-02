import { WEATHERKIT_DATASETS } from "@/lib/weather/weatherkit-datasets";

export class WeatherKitNotConfiguredError extends Error {
  constructor(hint) {
    super("WeatherKit is not configured");
    this.name = "WeatherKitNotConfiguredError";
    this.hint = hint;
  }
}

export async function fetchWeatherKit(lat, lon, dataSets = WEATHERKIT_DATASETS) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    dataSets,
  });

  const response = await fetch(`/api/weather?${params.toString()}`);

  const text = await response.text();
  let payload = {};
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      if (!response.ok) {
        throw new Error(`WeatherKit request failed (${response.status})`);
      }
      throw new Error("WeatherKit response was not JSON");
    }
  }

  if (response.status === 503) {
    throw new WeatherKitNotConfiguredError(payload.hint);
  }

  if (!response.ok) {
    throw new Error(payload.error || `WeatherKit request failed (${response.status})`);
  }

  return payload;
}
