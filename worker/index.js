import { onRequestGet as getAlerts } from "../functions/api/alerts.js";
import { onRequestGet as getActiveStorms } from "../functions/api/getActiveStorms.js";
import { onRequestGet as getWeather } from "../functions/api/weather.js";
import { onRequestGet as getLightning } from "../functions/api/lightning.js";
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
