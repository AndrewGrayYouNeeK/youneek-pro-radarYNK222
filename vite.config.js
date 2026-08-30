import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import { nwsApiMiddleware } from "./server/nwsApi.js";
import { onRequestGet as getWeather } from "./functions/api/weather.js";
import { onRequestGet as getLightning } from "./functions/api/lightning.js";
import { onRequestGet as getNews } from "./functions/api/news.js";
import { onRequestGet as getWildfires } from "./functions/api/wildfires.js";
import { onRequestGet as getTile } from "./functions/api/tile.js";

const NWS_HEADERS = { Accept: "application/geo+json", "User-Agent": "YouNeeKProRadar/1.0 (alerts)" };

const ALERT_EVENTS = {
  tornado: ["Tornado Warning"],
  tornado_watch: ["Tornado Watch"],
  thunderstorm: ["Severe Thunderstorm Warning"],
  flood: ["Flood Warning", "Flash Flood Warning", "Flood Watch", "Flash Flood Watch"],
  winter: [
    "Winter Storm Warning",
    "Blizzard Warning",
    "Ice Storm Warning",
    "Winter Weather Advisory",
    "Blizzard Watch",
    "Winter Storm Watch",
  ],
};

async function fetchNwsAlerts(type) {
  const events = ALERT_EVENTS[type];
  if (!events) {
    return { status: 400, body: { error: `Unknown alert type: ${type}` } };
  }

  const features = [];
  const seen = new Set();

  for (const event of events) {
    const url = `https://api.weather.gov/alerts/active?status=actual&event=${encodeURIComponent(event)}`;
    const response = await fetch(url, { headers: NWS_HEADERS });
    if (!response.ok) continue;
    const payload = await response.json();
    for (const feature of payload?.features || []) {
      const id = feature?.id || feature?.properties?.id;
      const key = id || JSON.stringify(feature?.geometry?.coordinates?.[0]?.[0]);
      if (seen.has(key)) continue;
      seen.add(key);
      features.push(feature);
    }
  }

  return {
    status: 200,
    body: {
      type: "FeatureCollection",
      features,
      title: "Active weather alerts",
      updated: new Date().toISOString(),
    },
  };
}

function attachJsonRoute(server, route, handler) {
  server.middlewares.use(route, async (req, res) => {
    try {
      const result = await handler(req);
      res.statusCode = result.status;
      if (result.headers) {
        for (const [key, value] of Object.entries(result.headers)) {
          res.setHeader(key, value);
        }
      }
      res.setHeader("Content-Type", result.contentType || "application/json");
      res.end(typeof result.body === "string" ? result.body : JSON.stringify(result.body));
    } catch {
      res.statusCode = 502;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "proxy failed" }));
    }
  });
}

function radarApiDevProxy(mode) {
  return {
    name: "radar-api-dev-proxy",
    configureServer(server) {
      attachRadarApi(server, mode);
    },
    configurePreviewServer(server) {
      attachRadarApi(server, mode);
    },
  };
}

function attachRadarApi(server, mode) {
  const env = loadEnv(mode, process.cwd(), "");
  const workerEnv = {
    WEATHERKIT_TEAM_ID: env.WEATHERKIT_TEAM_ID,
    WEATHERKIT_KEY_ID: env.WEATHERKIT_KEY_ID,
    WEATHERKIT_SERVICE_ID: env.WEATHERKIT_SERVICE_ID,
    WEATHERKIT_PRIVATE_KEY: env.WEATHERKIT_PRIVATE_KEY,
  };

  attachJsonRoute(server, "/api/alerts", async (req) => {
    const url = new URL(req.url || "", "http://localhost");
    const type = url.searchParams.get("type") || "tornado";
    return fetchNwsAlerts(type);
  });

  attachJsonRoute(server, "/api/weather", async (req) => {
    const request = new Request(`http://localhost${req.url}`, { method: req.method });
    const response = await getWeather({ request, env: workerEnv });
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return { status: response.status, body: await response.text(), contentType: "application/json", headers };
  });

  attachJsonRoute(server, "/api/lightning", async () => {
    const response = await getLightning();
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return { status: response.status, body: await response.text(), contentType: "application/json", headers };
  });

  attachJsonRoute(server, "/api/news", async () => {
    const response = await getNews();
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return { status: response.status, body: await response.text(), contentType: "application/json", headers };
  });

  attachJsonRoute(server, "/api/wildfires", async () => {
    const response = await getWildfires();
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return { status: response.status, body: await response.text(), contentType: "application/json", headers };
  });

  server.middlewares.use("/api/tile", async (req, res) => {
    try {
      const request = new Request(`http://localhost${req.url}`, { method: req.method });
      const response = await getTile({ request });
      res.statusCode = response.status;
      response.headers.forEach((value, key) => res.setHeader(key, value));
      const buffer = Buffer.from(await response.arrayBuffer());
      res.end(buffer);
    } catch {
      res.statusCode = 502;
      res.end();
    }
  });
}

function nwsLandingApi() {
  return {
    name: "nws-api",
    configureServer(server) {
      server.middlewares.use(nwsApiMiddleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(nwsApiMiddleware());
    },
  };
}

const hurricaneProxy = {
  "/api/getActiveStorms": {
    target: "https://www.nhc.noaa.gov",
    changeOrigin: true,
    rewrite: () => "/CurrentStorms.json",
    headers: { "User-Agent": "YouNeeKProRadar/1.0" },
  },
};

const frameHeaders = {
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "frame-ancestors 'none'",
};

export default defineConfig(({ mode }) => ({
  plugins: [react(), nwsLandingApi(), radarApiDevProxy(mode)],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    headers: frameHeaders,
    proxy: hurricaneProxy,
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
    headers: frameHeaders,
    proxy: hurricaneProxy,
  },
}));
