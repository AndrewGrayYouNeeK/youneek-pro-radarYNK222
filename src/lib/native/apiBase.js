export const DEFAULT_NATIVE_API_ORIGIN = "https://youneek-pro-radarynk222.youneekartifacts.workers.dev";

export function resolveApiOrigin({ native = false, configured = "", protocol = "" } = {}) {
  const fromEnv = String(configured || "").trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (native || protocol === "capacitor:" || protocol === "ionic:") return DEFAULT_NATIVE_API_ORIGIN;
  return "";
}

export function toApiUrl(input, origin) {
  const value = String(input || "");
  const isApiPath = value === "/api" || value.startsWith("/api/");
  if (!origin || !isApiPath) return value;
  return `${origin}${value}`;
}
