function firstFinite(...values) {
  for (const value of values) {
    if (Number.isFinite(Number(value))) return Number(value);
  }
  return null;
}

export async function fetchOpenMeteo(lat, lon) {
  const params = new URLSearchParams({ lat: String(lat), lon: String(lon) });
  const response = await fetch(`/api/forecast?${params.toString()}`);
  if (!response.ok) throw new Error("Forecast unavailable");
  return response.json();
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
