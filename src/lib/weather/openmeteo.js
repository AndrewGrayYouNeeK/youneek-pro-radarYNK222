const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

function firstFinite(...values) {
  for (const value of values) {
    if (Number.isFinite(Number(value))) return Number(value);
  }
  return null;
}

export async function fetchOpenMeteo(lat, lon) {
  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("wind_speed_unit", "mph");
  url.searchParams.set("precipitation_unit", "inch");
  url.searchParams.set("forecast_days", "16");
  url.searchParams.set("past_days", "1");
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "dew_point_2m",
      "precipitation",
      "weather_code",
      "cloud_cover",
      "pressure_msl",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
      "visibility",
      "is_day",
    ].join(",")
  );
  url.searchParams.set(
    "hourly",
    [
      "temperature_2m",
      "precipitation_probability",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
      "snowfall",
      "snow_depth",
      "uv_index",
      "relative_humidity_2m",
      "pressure_msl",
      "cloud_cover",
    ].join(",")
  );
  url.searchParams.set(
    "daily",
    [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "precipitation_sum",
      "snowfall_sum",
      "sunrise",
      "sunset",
      "uv_index_max",
    ].join(",")
  );
  url.searchParams.set("minutely_15", "precipitation,precipitation_probability");
  url.searchParams.set("forecast_minutely_15", "8");

  const response = await fetch(url.toString());
  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error(
      response.ok
        ? "Forecast response was not JSON"
        : `Forecast unavailable (${response.status})`
    );
  }
  if (!response.ok || payload?.error) {
    throw new Error(payload?.reason || payload?.error || `Forecast unavailable (${response.status})`);
  }
  return payload;
}

export function adaptOpenMeteoCurrent(payload) {
  const current = payload.current || {};
  const daily = payload.daily || {};
  const hourly = payload.hourly || {};
  const now = Date.now();
  const hourIndex = (hourly.time || []).findIndex((time) => Date.parse(time) >= now);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayIndex = Math.max(
    0,
    (daily.time || []).findIndex((date) => Date.parse(date) >= todayStart.getTime())
  );
  const uv =
    hourIndex >= 0 ? hourly.uv_index?.[hourIndex] : daily.uv_index_max?.[todayIndex] ?? daily.uv_index_max?.[0];

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
      condition_label: "",
      pressure_msl: current.pressure_msl,
      pressure_trend: "",
      visibility: current.visibility,
      visibility_mi: current.visibility != null ? current.visibility / 1609.344 : null,
      uv_index: firstFinite(uv),
      cloud_cover: current.cloud_cover,
      precipitation_intensity: current.precipitation,
      daylight: current.is_day === 1,
      as_of: current.time,
    },
    daily: {
      temperature_2m_max: [daily.temperature_2m_max?.[todayIndex]],
      temperature_2m_min: [daily.temperature_2m_min?.[todayIndex]],
      sunrise: [daily.sunrise?.[todayIndex]],
      sunset: [daily.sunset?.[todayIndex]],
    },
  };
}

export function adaptOpenMeteoHourly(payload, limit = 168) {
  const hourly = payload.hourly || {};
  const now = Date.now() - 30 * 60 * 1000;
  const rows = [];
  (hourly.time || []).forEach((time, index) => {
    if (Date.parse(time) < now) return;
    rows.push({
      time,
      temperature: Math.round(hourly.temperature_2m?.[index] ?? 0),
      pop: Math.round(hourly.precipitation_probability?.[index] ?? 0),
      precip: hourly.precipitation?.[index] ?? 0,
      wind: hourly.wind_speed_10m?.[index],
      snowDepth: hourly.snow_depth?.[index],
      snowfall: hourly.snowfall?.[index],
      label: "",
      weather_code: hourly.weather_code?.[index] ?? 0,
    });
  });
  return rows.slice(0, limit);
}

export function adaptOpenMeteoDaily(payload) {
  const daily = payload.daily || {};
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return (daily.time || [])
    .map((date, index) => ({
      date,
      high: Math.round(daily.temperature_2m_max?.[index] ?? 0),
      low: Math.round(daily.temperature_2m_min?.[index] ?? 0),
      pop: Math.round(daily.precipitation_probability_max?.[index] ?? 0),
      precip: daily.precipitation_sum?.[index] ?? 0,
      snowfall: daily.snowfall_sum?.[index] ?? 0,
      uv: daily.uv_index_max?.[index],
      sunrise: daily.sunrise?.[index],
      sunset: daily.sunset?.[index],
      label: "",
      weather_code: daily.weather_code?.[index] ?? 0,
    }))
    .filter((day) => Date.parse(day.date) >= todayStart.getTime() - 6 * 60 * 60 * 1000);
}

export function adaptOpenMeteoMinutes(payload) {
  const minutes = payload.minutely_15 || {};
  return (minutes.time || []).map((time, index) => ({
    time,
    chance: Math.round(minutes.precipitation_probability?.[index] ?? 0),
    intensity: minutes.precipitation?.[index] ?? 0,
  }));
}

export function adaptOpenMeteoExtras(payload) {
  const hourly = payload.hourly || {};
  const daily = payload.daily || {};
  const now = Date.now();
  const futureHours = [];
  (hourly.time || []).forEach((time, index) => {
    const stamp = Date.parse(time);
    if (stamp >= now && futureHours.length < 24) {
      futureHours.push({
        precip: Number(hourly.precipitation?.[index] || 0),
        pop: Number(hourly.precipitation_probability?.[index] || 0),
        snowDepth: Number(hourly.snow_depth?.[index] || 0),
        snowfall: Number(hourly.snowfall?.[index] || 0),
      });
    }
  });

  const today = daily.time?.findIndex((date) => Date.parse(date) >= new Date().setHours(0, 0, 0, 0));
  const yesterday = today > 0 ? today - 1 : 0;

  return {
    precip24hIn: futureHours.reduce((sum, hour) => sum + hour.precip, 0),
    precipChance24h: futureHours.reduce((max, hour) => Math.max(max, hour.pop), 0),
    snowDepthIn: futureHours[0]?.snowDepth ?? 0,
    snowfall24hIn: futureHours.reduce((sum, hour) => sum + hour.snowfall, 0),
    yesterday:
      yesterday >= 0
        ? {
            date: daily.time?.[yesterday],
            high: daily.temperature_2m_max?.[yesterday],
            low: daily.temperature_2m_min?.[yesterday],
            precip: daily.precipitation_sum?.[yesterday],
          }
        : null,
  };
}
