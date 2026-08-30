export const API_ROUTES = [
  { method: "GET", path: "/api/health", purpose: "Worker status and route list" },
  { method: "GET", path: "/api/weather", purpose: "Apple WeatherKit (needs secrets)" },
  { method: "GET", path: "/api/forecast", purpose: "Open-Meteo current / hourly / 16-day" },
  { method: "GET", path: "/api/air", purpose: "Open-Meteo AQI, UV, pollen" },
  { method: "GET", path: "/api/geocode", purpose: "Place search" },
  { method: "GET", path: "/api/alerts", purpose: "NWS polygons or point alerts" },
  { method: "GET", path: "/api/lightning", purpose: "Lightning and storm reports" },
  { method: "GET", path: "/api/fires", purpose: "EONET + FIRMS wildfires" },
  { method: "GET", path: "/api/outlook", purpose: "SPC Day 1 storm risk" },
  { method: "GET", path: "/api/rainviewer", purpose: "Radar / future / satellite catalog" },
  { method: "GET", path: "/api/tile", purpose: "RainViewer tile proxy" },
  { method: "GET", path: "/api/getActiveStorms", purpose: "NHC tropical cyclones" },
  { method: "POST", path: "/api/nws", purpose: "Landing GPS, geocode, cells" },
];

export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export function withCors(response) {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders()).forEach(([key, value]) => {
    if (!headers.has(key)) headers.set(key, value);
  });
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function requireLatLon(request) {
  const url = new URL(request.url);
  const lat = Number(url.searchParams.get("lat"));
  const lon = Number(url.searchParams.get("lon"));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return { error: Response.json({ error: "lat and lon are required" }, { status: 400 }) };
  }
  return { lat, lon };
}

export async function proxyJson(target, init = {}, cacheSeconds = 120) {
  const response = await fetch(target, init);
  const body = await response.text();
  return new Response(body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "application/json",
      "Cache-Control": `public, max-age=${cacheSeconds}`,
      ...corsHeaders(),
    },
  });
}
