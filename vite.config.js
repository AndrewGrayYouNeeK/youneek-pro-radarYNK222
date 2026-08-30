import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import { nwsApiMiddleware } from "./server/nwsApi.js";
import { onRequestGet as getWeather } from "./functions/api/weather.js";
import { onRequestGet as getLightning } from "./functions/api/lightning.js";
import { onRequestGet as getFires } from "./functions/api/fires.js";
import { onRequestGet as getOutlook } from "./functions/api/outlook.js";
import { onRequestGet as getTile } from "./functions/api/tile.js";
import { onRequestGet as getAlertsWorker } from "./functions/api/alerts.js";

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
    const request = new Request(`http://localhost${req.url}`, { method: req.method });
    const response = await getAlertsWorker({ request });
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return { status: response.status, body: await response.text(), contentType: "application/json", headers };
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

  attachJsonRoute(server, "/api/fires", async () => {
    const response = await getFires();
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return { status: response.status, body: await response.text(), contentType: "application/json", headers };
  });

  attachJsonRoute(server, "/api/outlook", async (req) => {
    const request = new Request(`http://localhost${req.url}`, { method: req.method });
    const response = await getOutlook({ request });
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
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });
      const buffer = Buffer.from(await response.arrayBuffer());
      res.end(buffer);
    } catch {
      res.statusCode = 502;
      res.end("");
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
