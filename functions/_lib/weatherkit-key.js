import { MARKETING_URL, WEATHER_PROJECT, workerProjectFromEnv } from "./site.js";
import { normalizePrivateKey } from "./weatherkit.js";

function present(value) {
  return Boolean(String(value ?? "").trim());
}

export { normalizePrivateKey };

export function workerProjectName(env = {}) {
  return workerProjectFromEnv(env) || WEATHER_PROJECT;
}

export function weatherKitSecretsHint(env = {}) {
  const project = workerProjectName(env);
  return (
    `Set WEATHERKIT_TEAM_ID, WEATHERKIT_KEY_ID, WEATHERKIT_SERVICE_ID, and WEATHERKIT_PRIVATE_KEY ` +
    `as secrets on Cloudflare Worker ${project}. ` +
    `Run: npx wrangler secret put WEATHERKIT_TEAM_ID (then the other three names). See WEATHERKIT.md. ` +
    `The marketing site ${MARKETING_URL} does not use these secrets.`
  );
}

export function privateKeyLooksLikePem(raw) {
  try {
    const key = normalizePrivateKey(raw);
    return (
      key.includes("BEGIN") &&
      key.includes("PRIVATE KEY") &&
      key.includes("END") &&
      key.replace(/\s+/g, "").length > 80
    );
  } catch {
    return false;
  }
}

export function inspectWeatherKitEnv(env = {}) {
  const teamId = present(env.WEATHERKIT_TEAM_ID);
  const keyId = present(env.WEATHERKIT_KEY_ID);
  const serviceId = present(env.WEATHERKIT_SERVICE_ID);
  const privateKey = present(env.WEATHERKIT_PRIVATE_KEY);
  return {
    configured: teamId && keyId && serviceId && privateKey,
    project: workerProjectName(env),
    secrets: {
      WEATHERKIT_TEAM_ID: teamId,
      WEATHERKIT_KEY_ID: keyId,
      WEATHERKIT_SERVICE_ID: serviceId,
      WEATHERKIT_PRIVATE_KEY: privateKey,
    },
    privateKeyLooksLikePem: privateKeyLooksLikePem(env.WEATHERKIT_PRIVATE_KEY),
    missing: [
      !teamId && "WEATHERKIT_TEAM_ID",
      !keyId && "WEATHERKIT_KEY_ID",
      !serviceId && "WEATHERKIT_SERVICE_ID",
      !privateKey && "WEATHERKIT_PRIVATE_KEY",
    ].filter(Boolean),
  };
}

export function isWeatherKitConfigured(env) {
  return inspectWeatherKitEnv(env).configured;
}
