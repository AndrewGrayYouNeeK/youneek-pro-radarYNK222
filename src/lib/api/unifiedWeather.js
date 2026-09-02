import { fetchWeatherKit, WeatherKitNotConfiguredError } from "@/lib/api/weatherkit";
import {
  adaptWeatherKitAlerts,
  adaptWeatherKitCurrent,
  adaptWeatherKitDaily,
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

export async function fetchUnifiedWeather(lat, lon) {
  const [kitResult, openMeteo] = await Promise.all([
    fetchWeatherKit(lat, lon)
      .then((data) => ({ ok: true, data }))
      .catch((error) => ({ ok: false, error })),
    fetchOpenMeteo(lat, lon),
  ]);

  const omHourly = adaptOpenMeteoHourly(openMeteo);
  const omDaily = adaptOpenMeteoDaily(openMeteo);
  const extras = adaptOpenMeteoExtras(openMeteo);

  if (kitResult.ok) {
    const minutes = adaptWeatherKitNextHour(kitResult.data);
    return {
      source: "weatherkit",
      current: adaptWeatherKitCurrent(kitResult.data),
      hourly: mergeHourly(adaptWeatherKitHourly(kitResult.data), omHourly),
      daily: mergeDaily(adaptWeatherKitDaily(kitResult.data), omDaily),
      minutes: minutes.length ? minutes : adaptOpenMeteoMinutes(openMeteo),
      alerts: adaptWeatherKitAlerts(kitResult.data),
      extras,
    };
  }

  const current = adaptOpenMeteoCurrent(openMeteo);
  current.current.condition_label = describeWeatherCode(current.current.weather_code).label;

  return {
    source: "open-meteo",
    weatherkitError: kitResult.error,
    current,
    hourly: withLabels(omHourly),
    daily: withLabels(omDaily),
    minutes: adaptOpenMeteoMinutes(openMeteo),
    alerts: [],
    extras,
  };
}

export function isMissingWeatherKit(error) {
  return error instanceof WeatherKitNotConfiguredError;
}
