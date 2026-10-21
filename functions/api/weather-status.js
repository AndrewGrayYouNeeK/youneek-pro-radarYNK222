import { probeWeatherKitAuth, weatherKitAuthHint } from "../_lib/weatherkit-auth.js";
import { jsonWithCors } from "../_lib/cors.js";

export async function onRequestGet({ env }) {
  const status = await probeWeatherKitAuth(env);
  return jsonWithCors(
    {
      ...status,
      hint: weatherKitAuthHint(status.auth, env, status.error),
      fallback: ["open-meteo", "nws"],
    },
    {
      headers: { "Cache-Control": "no-store" },
    }
  );
}
