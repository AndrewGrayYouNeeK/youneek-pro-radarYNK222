/** Public WeatherBug-style app (youneekproradarbaby Worker). */
export const WEATHER_APP_ORIGIN = "https://youneekproradar.com";

const LOCAL_HOST = /^(localhost|127\.\d+\.\d+\.\d+|.*\.local)$/i;

export function isLocalHost(hostname = typeof window === "undefined" ? "" : window.location.hostname) {
  const host = String(hostname || "").split(":")[0];
  return !host || LOCAL_HOST.test(host);
}

/** Map landing CTAs onto the live youneekproradar.com app. `/app` opens NOW. */
export const WEATHER_REDIRECTS = {
  "/app": "/",
  "/Radar": "/Radar",
  "/Forecast": "/Forecast",
  "/Hourly": "/Hourly",
  "/Daily": "/Daily",
  "/Globe": "/Globe",
  "/Settings": "/Settings",
  "/Contacts": "/Contacts",
  "/Radio": "/Radio",
};

export function weatherRedirect(pathname, origin = WEATHER_APP_ORIGIN) {
  if (!Object.prototype.hasOwnProperty.call(WEATHER_REDIRECTS, pathname)) return null;
  return `${origin.replace(/\/$/, "")}${WEATHER_REDIRECTS[pathname]}`;
}

export function weatherHref(path = "/", hostname) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (isLocalHost(hostname)) {
    return normalized === "/" ? "/app" : normalized;
  }
  const dest = normalized === "/app" ? "/" : normalized;
  return `${WEATHER_APP_ORIGIN}${dest}`;
}
