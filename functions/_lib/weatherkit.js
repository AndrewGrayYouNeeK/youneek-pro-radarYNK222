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
