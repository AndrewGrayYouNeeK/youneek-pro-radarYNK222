import { SignJWT, importPKCS8 } from "jose";

const WEATHERKIT_BASE = "https://weatherkit.apple.com/api/v1/weather";
const DEFAULT_DATASETS =
  "currentWeather,forecastHourly,forecastDaily,forecastNextHour,weatherAlerts";

export function isWeatherKitConfigured(env) {
  return Boolean(
    env.WEATHERKIT_TEAM_ID &&
      env.WEATHERKIT_KEY_ID &&
      env.WEATHERKIT_SERVICE_ID &&
      env.WEATHERKIT_PRIVATE_KEY
  );
}

function normalizePrivateKey(key) {
  return key.replace(/\\n/g, "\n");
}

export async function createWeatherKitToken(env) {
  const teamId = env.WEATHERKIT_TEAM_ID;
  const keyId = env.WEATHERKIT_KEY_ID;
  const serviceId = env.WEATHERKIT_SERVICE_ID;
  const privateKey = await importPKCS8(normalizePrivateKey(env.WEATHERKIT_PRIVATE_KEY), "ES256");

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

export async function fetchWeatherKit(env, lat, lon, dataSets = DEFAULT_DATASETS) {
  if (!isWeatherKitConfigured(env)) {
    throw new Error("WeatherKit is not configured");
  }

  const latitude = Number(lat);
  const longitude = Number(lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Invalid coordinates");
  }

  const token = await createWeatherKitToken(env);
  const url = new URL(`${WEATHERKIT_BASE}/en/${latitude}/${longitude}`);
  url.searchParams.set("dataSets", dataSets);
  url.searchParams.set("units", "us");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("country", "US");

  const response = await fetch(url.toString(), {
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
