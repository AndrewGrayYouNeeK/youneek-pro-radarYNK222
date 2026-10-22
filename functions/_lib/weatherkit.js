import { SignJWT, importPKCS8 } from "jose";
import {
  datasetsFromAvailability,
  normalizeCountryCode,
  parseDatasetList,
  selectSupportedDatasets,
  weatherKitAvailabilityUrl,
  WEATHERKIT_DATASET_ORDER,
} from "./weatherkit-datasets.js";

const WEATHERKIT_BASE = "https://weatherkit.apple.com/api/v1/weather";
const DEFAULT_DATASETS = WEATHERKIT_DATASET_ORDER.join(",");
const NWS_HEADERS = {
  Accept: "application/geo+json",
  "User-Agent": "YouNeeKProRadar/1.0 (weatherkit)",
};

export function isWeatherKitConfigured(env) {
  return Boolean(
    env.WEATHERKIT_TEAM_ID &&
      env.WEATHERKIT_KEY_ID &&
      env.WEATHERKIT_SERVICE_ID &&
      env.WEATHERKIT_PRIVATE_KEY
  );
}

export function normalizePrivateKey(raw) {
  if (raw == null) return "";
  let key = String(raw).replace(/^\uFEFF/, "").trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }
  key = key
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  const beginMatch = key.match(/-----BEGIN ([A-Z0-9 ]+)-----/);
  const endMatch = key.match(/-----END ([A-Z0-9 ]+)-----/);
  let label = "PRIVATE KEY";
  let body = key;

  if (beginMatch && endMatch) {
    label = beginMatch[1].trim();
    body = key
      .slice(key.indexOf(beginMatch[0]) + beginMatch[0].length, key.lastIndexOf(endMatch[0]))
      .replace(/\s+/g, "");
  } else {
    body = key.replace(/\s+/g, "");
  }

  if (label === "EC PRIVATE KEY") {
    throw new Error(
      "WeatherKit needs the .p8 PKCS#8 key (-----BEGIN PRIVATE KEY-----), not an EC PRIVATE KEY"
    );
  }

  if (!body) {
    throw new Error("WeatherKit private key is empty");
  }

  const folded = body.match(/.{1,64}/g) || [body];
  return `-----BEGIN ${label}-----\n${folded.join("\n")}\n-----END ${label}-----`;
}

export async function createWeatherKitToken(env) {
  const teamId = env.WEATHERKIT_TEAM_ID;
  const keyId = env.WEATHERKIT_KEY_ID;
  const serviceId = env.WEATHERKIT_SERVICE_ID;
  let privateKey;
  try {
    privateKey = await importPKCS8(normalizePrivateKey(env.WEATHERKIT_PRIVATE_KEY), "ES256");
  } catch (error) {
    if (String(error?.message || "").startsWith("WeatherKit")) {
      throw error;
    }
    throw new Error(
      "WeatherKit private key is not valid PKCS#8. Re-paste the full AuthKey_*.p8 file into the WEATHERKIT_PRIVATE_KEY secret, including the BEGIN PRIVATE KEY and END PRIVATE KEY lines."
    );
  }

  return new SignJWT({})
    .setProtectedHeader({
      alg: "ES256",
      kid: keyId,
      id: `${teamId}.${serviceId}`,
    })
    .setIssuer(teamId)
    .setSubject(serviceId)
    .setIssuedAt()
    .setExpirationTime("55m")
    .sign(privateKey);
}

export async function resolveCountryCode(lat, lon, explicit, fetchImpl = fetch) {
  const given = normalizeCountryCode(explicit);
  if (given) return given;
  const latitude = Number(lat);
  const longitude = Number(lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return "";

  try {
    const point = await fetchImpl(
      `https://api.weather.gov/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`,
      { headers: NWS_HEADERS, signal: AbortSignal.timeout(4000) }
    );
    if (point?.ok) return "US";
  } catch {
    /* try a reverse geocode next */
  }

  try {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/reverse");
    url.searchParams.set("latitude", String(latitude));
    url.searchParams.set("longitude", String(longitude));
    url.searchParams.set("count", "1");
    const response = await fetchImpl(url, { signal: AbortSignal.timeout(4000) });
    if (response?.ok) {
      const body = await response.json();
      return normalizeCountryCode(body?.results?.[0]?.country_code);
    }
  } catch {
    /* country stays blank and alerts are skipped */
  }
  return "";
}

async function readAvailability(fetchImpl, token, latitude, longitude, country) {
  try {
    const response = await fetchImpl(weatherKitAvailabilityUrl(latitude, longitude, country), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!response?.ok) return null;
    return datasetsFromAvailability(await response.json());
  } catch {
    return null;
  }
}

function datasetsForRequest(available, requested, country) {
  if (Array.isArray(available)) return selectSupportedDatasets(available, requested);
  const want = parseDatasetList(requested);
  const base = selectSupportedDatasets(null, want);
  if (country && want.includes("weatherAlerts")) return [...base, "weatherAlerts"];
  return base.length ? base : ["currentWeather"];
}

async function requestWeather(fetchImpl, token, latitude, longitude, datasets, country) {
  const url = new URL(`${WEATHERKIT_BASE}/en/${latitude}/${longitude}`);
  url.searchParams.set("dataSets", datasets.join(","));
  url.searchParams.set("units", "us");
  url.searchParams.set("timezone", "auto");
  if (country) url.searchParams.set("country", country);

  const response = await fetchImpl(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`WeatherKit ${response.status}${detail ? `: ${detail}` : ""}`);
  }

  return response.json();
}

export async function fetchWeatherKit(env, lat, lon, dataSets = DEFAULT_DATASETS, extra = {}) {
  const options = dataSets && typeof dataSets === "object" ? dataSets : { dataSets, ...extra };
  if (!isWeatherKitConfigured(env)) {
    throw new Error("WeatherKit is not configured");
  }

  const latitude = Number(lat);
  const longitude = Number(lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Invalid coordinates");
  }

  const fetchImpl = options.fetchImpl || fetch;
  const token = options.token || (await createWeatherKitToken(env));
  const requested = options.dataSets || DEFAULT_DATASETS;
  const country = await resolveCountryCode(latitude, longitude, options.country, fetchImpl);
  const available = await readAvailability(fetchImpl, token, latitude, longitude, country);
  const datasets = datasetsForRequest(available, requested, country);
  try {
    return await requestWeather(fetchImpl, token, latitude, longitude, datasets, country);
  } catch (error) {
    if (!datasets.includes("weatherAlerts") || !/\b400\b/.test(String(error?.message || ""))) throw error;
    const retry = datasets.filter((name) => name !== "weatherAlerts");
    if (!retry.length) throw error;
    return requestWeather(fetchImpl, token, latitude, longitude, retry, country);
  }
}
