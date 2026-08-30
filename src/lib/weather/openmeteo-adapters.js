import { describeWeatherCode } from "./conditions.js";

function popPercent(value) {
  if (value == null) return 0;
  return Math.round(value <= 1 ? value * 100 : value);
}

export function adaptOpenMeteoCurrent(data) {
  const current = data?.current || {};
  const daily = data?.daily || {};
  const code = describeWeatherCode(current.weather_code);

  return {
    current: {
      temperature_2m: current.temperature_2m,
      apparent_temperature: current.apparent_temperature,
      dew_point: current.dew_point_2m,
      relative_humidity_2m: current.relative_humidity_2m,
      wind_speed_10m: current.wind_speed_10m,
      wind_direction_10m: current.wind_direction_10m,
      wind_gusts_10m: current.wind_gusts_10m,
      weather_code: current.weather_code,
      condition_label: code.label,
      pressure_msl: current.pressure_msl,
      pressure_trend: "",
      visibility: current.visibility,
      visibility_mi: current.visibility != null ? current.visibility / 1609.344 : null,
      uv_index: current.uv_index,
      cloud_cover: current.cloud_cover,
      precipitation_intensity: current.precipitation,
      daylight: current.is_day === 1,
      as_of: current.time,
    },
    daily: {
      temperature_2m_max: daily.temperature_2m_max,
      temperature_2m_min: daily.temperature_2m_min,
      sunrise: daily.sunrise,
      sunset: daily.sunset,
      precipitation_sum: daily.precipitation_sum,
    },
  };
}

export function adaptOpenMeteoHourly(data) {
  const hourly = data?.hourly || {};
  const times = hourly.time || [];
  const now = Date.now();

  return times
    .map((time, index) => ({
      time,
      temperature: Math.round(hourly.temperature_2m?.[index] ?? 0),
      pop: popPercent(hourly.precipitation_probability?.[index]),
      label: describeWeatherCode(hourly.weather_code?.[index]).label,
      weather_code: hourly.weather_code?.[index] ?? 0,
    }))
    .filter((hour) => Date.parse(hour.time) >= now - 30 * 60 * 1000)
    .slice(0, 48);
}

export function adaptOpenMeteoDaily(data) {
  const daily = data?.daily || {};
  const dates = daily.time || [];

  return dates.slice(0, 14).map((date, index) => ({
    date,
    high: Math.round(daily.temperature_2m_max?.[index] ?? 0),
    low: Math.round(daily.temperature_2m_min?.[index] ?? 0),
    pop: popPercent(daily.precipitation_probability_max?.[index]),
    label: describeWeatherCode(daily.weather_code?.[index]).label,
    weather_code: daily.weather_code?.[index] ?? 0,
    precip: daily.precipitation_sum?.[index] ?? 0,
    uv: daily.uv_index_max?.[index],
  }));
}

export function adaptOpenMeteoNextHour(data) {
  const minutes = data?.minutely_15 || {};
  const times = minutes.time || [];
  const values = minutes.precipitation || [];

  return times.slice(0, 8).flatMap((time, index) => {
    const intensity = Number(values[index] || 0);
    return [0, 5, 10].map((offset) => ({
      time: new Date(Date.parse(time) + offset * 60000).toISOString(),
      chance: intensity > 0.01 ? 70 : 10,
      intensity: intensity / 3,
    }));
  });
}
