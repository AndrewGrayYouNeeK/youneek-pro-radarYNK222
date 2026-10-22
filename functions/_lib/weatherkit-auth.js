import { createWeatherKitToken } from "./weatherkit.js";
import { inspectWeatherKitEnv, weatherKitSecretsHint } from "./weatherkit-key.js";
import { datasetsFromAvailability, WEATHERKIT_STATUS_AVAILABILITY_URL } from "./weatherkit-datasets.js";

export const WEATHERKIT_AVAILABILITY_URL = WEATHERKIT_STATUS_AVAILABILITY_URL;

export function sanitizeWeatherKitError(message) {
  return String(message || "WeatherKit request failed")
    .replace(/Bearer\s+\S+/gi, "Bearer [redacted]")
    .replace(/-----BEGIN[\s\S]*?-----END[^-]*-----/g, "[redacted key]")
    .slice(0, 180);
}

export function weatherKitAuthHint(auth, env, error) {
  switch (auth) {
    case "ok":
      return "WeatherKit accepted the ES256 token.";
    case "missing":
      return weatherKitSecretsHint(env);
    case "invalid_key":
      return error || "The WeatherKit private key could not be signed. Paste the full .p8 file into WEATHERKIT_PRIVATE_KEY.";
    case "rejected":
      return "Apple rejected the token. Enable WeatherKit on the key and the Services ID, then recheck Team ID, Key ID, Service ID, and the .p8.";
    case "unreachable":
      return "Could not reach weatherkit.apple.com. Forecast stays on Open-Meteo and NWS until Apple answers.";
    default:
      return `${weatherKitSecretsHint(env)} (${String(auth || "unknown")})`;
  }
}

export async function probeWeatherKitAuth(env = {}, options = {}) {
  const status = inspectWeatherKitEnv(env);
  const base = {
    configured: status.configured,
    project: status.project,
    secrets: status.secrets,
    privateKeyLooksLikePem: status.privateKeyLooksLikePem,
    missing: status.missing,
    appleStatus: null,
    datasets: null,
    error: null,
  };

  if (!status.configured) {
    return { ...base, ok: false, auth: "missing" };
  }

  const fetchImpl = options.fetchImpl || fetch;
  const signToken = options.signToken || (() => createWeatherKitToken(env));
  let token;
  try {
    token = await signToken();
  } catch (error) {
    return {
      ...base,
      ok: false,
      auth: "invalid_key",
      error: sanitizeWeatherKitError(error?.message),
    };
  }

  if (!token || typeof token !== "string") {
    return { ...base, ok: false, auth: "invalid_key", error: "WeatherKit token was empty" };
  }

  try {
    const response = await fetchImpl(WEATHERKIT_AVAILABILITY_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    if (response.ok) {
      let datasets = null;
      try {
        datasets = datasetsFromAvailability(await response.json());
      } catch {
        datasets = null;
      }
      return {
        ...base,
        ok: true,
        auth: "ok",
        appleStatus: response.status,
        datasets,
      };
    }
    return {
      ...base,
      ok: false,
      auth: "rejected",
      appleStatus: response.status,
      error: `Apple WeatherKit returned ${response.status}`,
    };
  } catch {
    return {
      ...base,
      ok: false,
      auth: "unreachable",
      error: "Could not reach Apple WeatherKit",
    };
  }
}
