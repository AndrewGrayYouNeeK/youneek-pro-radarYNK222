import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import worker from "./worker/index.js";

const frameHeaders = {
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "frame-ancestors 'none'",
};

function collectBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function workerApiDevProxy(mode) {
  const env = loadEnv(mode, process.cwd(), "");
  const workerEnv = {
    APP_NAME: "YouNeeK Pro Radar",
    WEATHERKIT_TEAM_ID: env.WEATHERKIT_TEAM_ID,
    WEATHERKIT_KEY_ID: env.WEATHERKIT_KEY_ID,
    WEATHERKIT_SERVICE_ID: env.WEATHERKIT_SERVICE_ID,
    WEATHERKIT_PRIVATE_KEY: env.WEATHERKIT_PRIVATE_KEY,
    ASSETS: {
      fetch: () => new Response("Not found", { status: 404 }),
    },
  };

  const middleware = async (req, res, next) => {
    const url = req.url || "";
    if (!url.startsWith("/api/")) return next();

    try {
      const method = req.method || "GET";
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers || {})) {
        if (value) headers.set(key, Array.isArray(value) ? value.join(",") : String(value));
      }

      const init = { method, headers };
      if (method !== "GET" && method !== "HEAD") {
        const body = await collectBody(req);
        if (body.length) {
          init.body = body;
          init.duplex = "half";
        }
      }

      const request = new Request(`http://localhost${url}`, init);
      const response = await worker.fetch(request, workerEnv);
      res.statusCode = response.status;
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });
      const buffer = Buffer.from(await response.arrayBuffer());
      res.end(buffer);
    } catch (error) {
      res.statusCode = 502;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: error.message || "Worker proxy failed" }));
    }
  };

  return {
    name: "worker-api-dev-proxy",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), workerApiDevProxy(mode)],
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
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
    headers: frameHeaders,
  },
}));
