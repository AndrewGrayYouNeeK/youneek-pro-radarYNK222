import { API_ROUTES } from "../_lib/http.js";
import { isWeatherKitConfigured } from "../_lib/weatherkit.js";

export async function onRequestGet(context) {
  return Response.json({
    ok: true,
    service: context.env?.APP_NAME || "YouNeeK Pro Radar",
    weatherkit: isWeatherKitConfigured(context.env || {}),
    routes: API_ROUTES,
    time: new Date().toISOString(),
  });
}
