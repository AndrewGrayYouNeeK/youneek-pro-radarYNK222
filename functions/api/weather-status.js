import { inspectWeatherKitEnv, weatherKitSecretsHint } from "../_lib/weatherkit-key.js";
import { jsonWithCors } from "../_lib/cors.js";

export async function onRequestGet({ env }) {
  const status = inspectWeatherKitEnv(env);
  return jsonWithCors(
    {
      ...status,
      hint: status.configured
        ? `Weather website ${status.project} has all four secrets. If forecasts still say Open-Meteo, Apple is rejecting the token or the private key cannot be parsed.`
        : weatherKitSecretsHint(env),
    },
    {
      headers: { "Cache-Control": "no-store" },
    }
  );
}
