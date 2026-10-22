import { fetchWeatherKit, WeatherKitNotConfiguredError } from "@/lib/api/weatherkit";
import {
  adaptWeatherKitAlerts,
  adaptWeatherKitCurrent,
  adaptWeatherKitDaily,
  adaptWeatherKitDetails,
  adaptWeatherKitHourly,
  adaptWeatherKitNextHour,
} from "@/lib/weather/weatherkit-adapters";
import {
  adaptOpenMeteoCurrent,
  adaptOpenMeteoDaily,
  adaptOpenMeteoExtras,
  adaptOpenMeteoHourly,
  adaptOpenMeteoMinutes,
  fetchOpenMeteo,
} from "@/lib/weather/openmeteo";
import { describeWeatherCode } from "@/lib/weather/conditions";
import { refineMinuteSeries } from "@/lib/weather/rainTiming";

function withLabels(rows) {
  return rows.map((row) => {
    const code = describeWeatherCode(row.weather_code);
    return {
      ...row,
      label: row.label || code.label,
    };
  });
}

function mergeHourly(primary, extra) {
  const seen = new Set(primary.map((row) => row.time));
  const rest = extra.filter((row) => !seen.has(row.time));
  return withLabels([...primary, ...rest]).slice(0, 168);
}

function mergeDaily(primary, extra) {
  const seen = new Set(primary.map((row) => String(row.date).slice(0, 10)));
  const rest = extra.filter((row) => !seen.has(String(row.date).slice(0, 10)));
  return withLabels([...primary, ...rest]).slice(0, 16);
}

export function bundleOpenMeteo(openMeteo) {
  const current = adaptOpenMeteoCurrent(openMeteo);
  current.current.condition_label = describeWeatherCode(current.current.weather_code).label;
  const openMeteoMinutes = adaptOpenMeteoMinutes(openMeteo);
  return {
    source: "open-meteo",
    current,
    hourly: withLabels(adaptOpenMeteoHourly(openMeteo)),
    daily: withLabels(adaptOpenMeteoDaily(openMeteo)),
    minutes: openMeteoMinutes,
    openMeteoMinutes,
    weatherKitMinutes: [],
    alerts: [],
    extras: adaptOpenMeteoExtras(openMeteo),
  };
}

export function enrichWithWeatherKit(base, kitData) {
  if (!kitData) return base || null;
  const weatherKitMinutes = adaptWeatherKitNextHour(kitData);
  const details = adaptWeatherKitDetails(kitData);
  const openMeteoMinutes = base?.openMeteoMinutes || [];
  return {
    source: "weatherkit",
    current: adaptWeatherKitCurrent(kitData),
    hourly: mergeHourly(adaptWeatherKitHourly(kitData), base?.hourly || []),
    daily: mergeDaily(adaptWeatherKitDaily(kitData), base?.daily || []),
    minutes: refineMinuteSeries(openMeteoMinutes, weatherKitMinutes),
    openMeteoMinutes,
    weatherKitMinutes,
    alerts: adaptWeatherKitAlerts(kitData),
    details,
    attributionUrl: details.attributionUrl,
    extras: base?.extras || null,
  };
}

export async function fetchUnifiedWeather(lat, lon) {
  const [kitResult, omResult] = await Promise.all([
    fetchWeatherKit(lat, lon)
      .then((data) => ({ ok: true, data }))
      .catch((error) => ({ ok: false, error })),
    fetchOpenMeteo(lat, lon)
      .then((data) => ({ ok: true, data }))
      .catch((error) => ({ ok: false, error })),
  ]);

  const base = omResult.ok ? bundleOpenMeteo(omResult.data) : null;
  if (kitResult.ok) return enrichWithWeatherKit(base, kitResult.data);
  if (!base) throw omResult.error || kitResult.error || new Error("Forecast unavailable");
  return { ...base, weatherkitError: kitResult.error };
}

export function isMissingWeatherKit(error) {
  return error instanceof WeatherKitNotConfiguredError;
}
