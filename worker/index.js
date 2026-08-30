import { onRequestGet as getAlerts } from "../functions/api/alerts.js";
import { onRequestGet as getActiveStorms } from "../functions/api/getActiveStorms.js";
import { onRequestGet as getWeather } from "../functions/api/weather.js";
import { onRequestGet as getLightning } from "../functions/api/lightning.js";
import { onRequestGet as getFires } from "../functions/api/fires.js";
import { onRequestGet as getOutlook } from "../functions/api/outlook.js";
import { onRequestGet as getTile } from "../functions/api/tile.js";
import { onRequestGet as getHealth } from "../functions/api/health.js";
import { onRequestGet as getForecast } from "../functions/api/forecast.js";
import { onRequestGet as getAir } from "../functions/api/air.js";
import { onRequestGet as getGeocode } from "../functions/api/geocode.js";
import { onRequestGet as getRainviewer } from "../functions/api/rainviewer.js";
import { corsHeaders, withCors } from "../functions/_lib/http.js";
import { handleNwsRequest } from "../server/nwsApi.js";

const GET_ROUTES = {
  "/api/health": getHealth,
  "/api/alerts": getAlerts,
  "/api/getActiveStorms": getActiveStorms,
  "/api/weather": getWeather,
  "/api/forecast": getForecast,
  "/api/air": getAir,
  "/api/geocode": getGeocode,
  "/api/lightning": getLightning,
  "/api/fires": getFires,
  "/api/outlook": getOutlook,
  "/api/rainviewer": getRainviewer,
  "/api/tile": getTile,
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname.startsWith("/api/") && request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (pathname.startsWith("/api/")) {
      console.log(JSON.stringify({ message: "api", method: request.method, path: pathname }));
    }

    try {
      if (request.method === "GET" && GET_ROUTES[pathname]) {
        return withCors(await GET_ROUTES[pathname]({ request, env }));
      }

      if (request.method === "POST" && pathname === "/api/nws") {
        const params = await request.json();
        const data = await handleNwsRequest(params);
        return withCors(Response.json({ data }));
      }

      if (pathname.startsWith("/api/")) {
        return withCors(Response.json({ error: "Not found" }, { status: 404 }));
      }
    } catch (error) {
      console.error(JSON.stringify({
        message: "api failed",
        path: pathname,
        error: error.message || String(error),
      }));
      return withCors(
        Response.json(
          { error: error.message || "API request failed" },
          { status: error.status || 500 }
        )
      );
    }

    return env.ASSETS.fetch(request);
  },
};
