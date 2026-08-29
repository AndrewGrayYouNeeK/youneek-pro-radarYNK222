import { fetchWeatherKit, isWeatherKitConfigured } from "../_lib/weatherkit.js";

export async function onRequestGet(context) {
  const { env, request } = context;

  if (!isWeatherKitConfigured(env)) {
    return Response.json(
      {
        error: "WeatherKit is not configured",
        hint: "Set WEATHERKIT_* secrets in Cloudflare or .env for local dev — see WEATHERKIT.md",
      },
      { status: 503 }
    );
  }

  const url = new URL(request.url);
  const lat = url.searchParams.get("lat");
  const lon = url.searchParams.get("lon");
  const dataSets = url.searchParams.get("dataSets");

  if (!lat || !lon) {
    return Response.json({ error: "lat and lon are required" }, { status: 400 });
  }

  try {
    const data = await fetchWeatherKit(env, lat, lon, dataSets || undefined);
    return Response.json(data, {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err) {
    return Response.json({ error: err.message || "WeatherKit request failed" }, { status: 502 });
  }
}
