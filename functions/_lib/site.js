export const WEATHER_PROJECT = "youneek-pro-radarynk222";
export const LANDING_PROJECT = "youneek-pro-radar-landing";
export const DEFAULT_WEATHER_APP_URL = "https://youneek-pro-radarynk222.youneekartifacts.workers.dev";
export const PUBLIC_WEATHER_HOSTS = ["youneekproradar.com", "www.youneekproradar.com"];

export function workerProjectFromEnv(env = {}) {
  return String(env.WORKER_PROJECT || env.CLOUDFLARE_WORKER_NAME || "").trim();
}

export function siteRoleFromEnv(env = {}) {
  const explicit = String(env.SITE_ROLE || "").trim().toLowerCase();
  if (explicit === "landing" || explicit === "weather" || explicit === "local") return explicit;
  const name = workerProjectFromEnv(env).toLowerCase();
  if (name.includes("landing") || name === LANDING_PROJECT) return "landing";
  if (name.includes("ynk222") || name === WEATHER_PROJECT || name.includes("youneekproradarbaby")) return "weather";
  return "weather";
}

export function siteRoleFromHost(hostname = "") {
  const host = String(hostname).toLowerCase().split(":")[0];
  if (!host || host === "localhost" || host.startsWith("127.") || host.endsWith(".local")) {
    return "local";
  }
  if (host.includes("youneek-pro-radar-landing") || host.includes("radar-landing")) return "landing";
  if (
    host.includes("youneek-pro-radarynk222") ||
    host.includes("radarynk222") ||
    host.includes("youneekproradarbaby") ||
    PUBLIC_WEATHER_HOSTS.includes(host)
  ) {
    return "weather";
  }
  return "weather";
}

export function resolveSiteRole(apiRole, hostname = "") {
  if (apiRole === "landing" || apiRole === "weather") return apiRole;
  const hostRole = siteRoleFromHost(hostname);
  if (hostRole === "landing" || hostRole === "weather") return hostRole;
  return "weather";
}

export function homePathForRole(role) {
  return role === "landing" ? "/" : "/Radar";
}

export function describeSite(env = {}) {
  const role = siteRoleFromEnv(env);
  const configured = String(env.WEATHER_APP_URL || "").trim().replace(/\/$/, "");
  const weatherAppUrl = configured || (role === "landing" ? DEFAULT_WEATHER_APP_URL : "");
  const landingAppUrl = String(env.LANDING_APP_URL || "").trim().replace(/\/$/, "");
  return {
    role,
    project: role === "landing" ? LANDING_PROJECT : WEATHER_PROJECT,
    weatherProject: WEATHER_PROJECT,
    landingProject: LANDING_PROJECT,
    weatherAppUrl,
    landingAppUrl,
    homePath: homePathForRole(role === "local" ? "weather" : role),
  };
}
