import { onRequestGet as getAlerts } from "../functions/api/alerts.js";
import { onRequestGet as getActiveStorms } from "../functions/api/getActiveStorms.js";
import { onRequestGet as getWeather } from "../functions/api/weather.js";
import { onRequestGet as getLightning } from "../functions/api/lightning.js";
import { onRequestGet as getNews } from "../functions/api/news.js";
import { onRequestGet as getWildfires } from "../functions/api/wildfires.js";
import { onRequestGet as getFires } from "../functions/api/fires.js";
import { onRequestGet as getOutlook } from "../functions/api/outlook.js";
import { onRequestGet as getTile } from "../functions/api/tile.js";
import { onRequestGet as getPointAlerts } from "../functions/api/point-alerts.js";
import { onRequestGet as getSite } from "../functions/api/site.js";
import { onRequestGet as getWeatherStatus } from "../functions/api/weather-status.js";
import { handleNwsRequest } from "../server/nwsApi.js";
import { finalizeAssetResponse } from "./serveAssets.js";

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

    if (request.method === "GET" && pathname === "/api/news") {
      return getNews();
    }

    if (request.method === "GET" && pathname === "/api/wildfires") {
      return getWildfires();
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

    if (request.method === "OPTIONS" && pathname.startsWith("/api/")) {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method === "GET" && pathname === "/api/point-alerts") {
      return getPointAlerts({ request });
    }

    if (request.method === "GET" && pathname === "/api/site") {
      return getSite({ env });
    }

    if (request.method === "GET" && pathname === "/api/weather-status") {
      return getWeatherStatus({ env });
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

    const assetResponse = await env.ASSETS.fetch(request);
    return finalizeAssetResponse(request, assetResponse);
  },
};
