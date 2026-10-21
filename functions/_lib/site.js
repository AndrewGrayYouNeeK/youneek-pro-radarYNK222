export const WEATHER_PROJECT = "youneek-pro-radarynk222";
export const MARKETING_URL = "https://youneekproradar.com";
export const DEFAULT_WEATHER_APP_URL = "https://youneek-pro-radarynk222.youneekartifacts.workers.dev";

export function workerProjectFromEnv(env = {}) {
  return String(env.WORKER_PROJECT || env.CLOUDFLARE_WORKER_NAME || "").trim();
}

export function describeSite(env = {}) {
  const configured = workerProjectFromEnv(env);
  return {
    role: "weather",
    project: configured || WEATHER_PROJECT,
    weatherProject: WEATHER_PROJECT,
    marketingUrl: MARKETING_URL,
    homePath: "/",
  };
}
