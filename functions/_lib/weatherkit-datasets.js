export const WEATHERKIT_DATASET_ORDER = [
  "currentWeather",
  "forecastHourly",
  "forecastDaily",
  "forecastNextHour",
  "weatherAlerts",
];

const COUNTRY_OPTIONAL = new Set(["weatherAlerts", "airQuality"]);

export function normalizeCountryCode(value) {
  const code = String(value || "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : "";
}

export function parseDatasetList(value) {
  const source = Array.isArray(value) ? value : String(value || "").split(",");
  return source.map((item) => String(item || "").trim()).filter(Boolean);
}

export function datasetsFromAvailability(body) {
  if (Array.isArray(body)) return body.map(String);
  if (Array.isArray(body?.datasets)) return body.datasets.map(String);
  return null;
}

export function weatherKitAvailabilityUrl(latitude, longitude, country) {
  const url = new URL(`https://weatherkit.apple.com/api/v1/availability/${latitude}/${longitude}`);
  const code = normalizeCountryCode(country);
  if (code) url.searchParams.set("country", code);
  return url.toString();
}

export const WEATHERKIT_STATUS_AVAILABILITY_URL = weatherKitAvailabilityUrl("37.3349", "-122.0090", "US");

export function selectSupportedDatasets(available, requested = WEATHERKIT_DATASET_ORDER) {
  const want = parseDatasetList(requested);
  const list = want.length ? want : [...WEATHERKIT_DATASET_ORDER];
  if (!Array.isArray(available)) {
    return list.filter((name) => !COUNTRY_OPTIONAL.has(name));
  }
  const allowed = new Set(available);
  return list.filter((name) => allowed.has(name));
}
