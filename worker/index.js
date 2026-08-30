import { onRequestGet as getAlerts } from "../functions/api/alerts.js";
import { onRequestGet as getActiveStorms } from "../functions/api/getActiveStorms.js";
import { onRequestGet as getWeather } from "../functions/api/weather.js";
import { onRequestGet as getLightning } from "../functions/api/lightning.js";
import { onRequestGet as getFires } from "../functions/api/fires.js";
import { onRequestGet as getOutlook } from "../functions/api/outlook.js";
import { onRequestGet as getTile } from "../functions/api/tile.js";
import { handleNwsRequest } from "../server/nwsApi.js";

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (request.method === "GET" && pathname === "/api/alerts") {
      return getAlerts({ request });
    }

    if (request.method === "GET" && pathname === "/api/getActiveStorms") {
      return getActiveStorms();
    }

    if (request.method === "GET" && pathname === "/api/weather") {
      return getWeather({ request, env });
    }

    if (request.method === "GET" && pathname === "/api/lightning") {
      return getLightning();
    }

    if (request.method === "GET" && pathname === "/api/fires") {
      return getFires();
    }

    if (request.method === "GET" && pathname === "/api/outlook") {
      return getOutlook({ request });
    }

    if (request.method === "GET" && pathname === "/api/tile") {
      return getTile({ request });
    }

    if (request.method === "POST" && pathname === "/api/nws") {
      try {
        const params = await request.json();
        const data = await handleNwsRequest(params);
        return Response.json({ data });
      } catch (error) {
        return Response.json(
          { error: error.message || "NWS request failed" },
          { status: error.status || 500 }
        );
      }
    }

    return env.ASSETS.fetch(request);
  },
};
