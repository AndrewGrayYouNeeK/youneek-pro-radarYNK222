import { formatConditionCode } from "./conditions.js";

const CONDITION_TO_WMO = {
  Clear: 0,
  MostlyClear: 1,
  PartlyCloudy: 2,
  MostlyCloudy: 2,
  Cloudy: 3,
  Fog: 45,
  Haze: 45,
  Smoky: 45,
  Breezy: 2,
  Windy: 2,
  Frigid: 71,
  Hot: 0,
  Hail: 96,
  Thunderstorms: 95,
  IsolatedThunderstorms: 95,
  ScatteredThunderstorms: 95,
  StrongStorms: 99,
  Drizzle: 53,
  HeavyRain: 65,
  Rain: 63,
  Showers: 80,
  Flurries: 71,
  HeavySnow: 75,
  Snow: 73,
  Blizzard: 75,
  BlowingSnow: 75,
  FreezingDrizzle: 56,
  FreezingRain: 66,
  Sleet: 77,
  WintryMix: 77,
  Hurricane: 95,
  TropicalStorm: 95,
};

function conditionToWmo(code) {
  return CONDITION_TO_WMO[code] ?? 0;
}

function popPercent(value) {
  if (value == null) return 0;
  return Math.round(value <= 1 ? value * 100 : value);
}

export function adaptWeatherKitCurrent(data) {
  const current = data?.currentWeather;
  const today = data?.forecastDaily?.days?.[0];

  return {
    current: {
      temperature_2m: current?.temperature,
      apparent_temperature: current?.temperatureApparent,
      dew_point: current?.temperatureDewPoint,
      relative_humidity_2m: (current?.humidity ?? 0) * 100,
      wind_speed_10m: current?.windSpeed,
      wind_direction_10m: current?.windDirection,
      wind_gusts_10m: current?.windGust,
      weather_code: conditionToWmo(current?.conditionCode),
      condition_label: formatConditionCode(current?.conditionCode),
      pressure_msl: current?.pressure,
      pressure_trend: current?.pressureTrend,
      visibility: current?.visibility,
      visibility_mi: current?.visibility != null ? current.visibility / 1609.344 : null,
      uv_index: current?.uvIndex,
      cloud_cover: current?.cloudCover != null ? Math.round(current.cloudCover * 100) : null,
      precipitation_intensity: current?.precipitationIntensity,
      daylight: current?.daylight,
      as_of: current?.asOf,
    },
    daily: {
      temperature_2m_max: [today?.temperatureMax],
      temperature_2m_min: [today?.temperatureMin],
      sunrise: [today?.sunrise],
      sunset: [today?.sunset],
    },
  };
}

export function adaptWeatherKitHourly(data) {
  const hours = data?.forecastHourly?.hours || [];

  return hours.slice(0, 48).map((hour) => ({
    time: hour.forecastStart,
    temperature: Math.round(hour.temperature ?? 0),
    pop: popPercent(hour.precipitationChance),
    label: formatConditionCode(hour.conditionCode),
    weather_code: conditionToWmo(hour.conditionCode),
  }));
}

export function adaptWeatherKitDaily(data) {
  const days = data?.forecastDaily?.days || [];

  return days.slice(0, 10).map((day) => ({
    date: day.forecastStart,
    high: Math.round(day.temperatureMax ?? 0),
    low: Math.round(day.temperatureMin ?? 0),
    pop: popPercent(day.precipitationChance),
    label: formatConditionCode(day.conditionCode),
    weather_code: conditionToWmo(day.conditionCode),
  }));
}

export function adaptWeatherKitNextHour(data) {
  const minutes = data?.forecastNextHour?.minutes || [];
  return minutes.map((minute) => ({
    time: minute.startTime,
    chance: popPercent(minute.precipitationChance),
    intensity: minute.precipitationIntensity ?? 0,
  }));
}

export function adaptWeatherKitAlerts(data) {
  const alerts = data?.weatherAlerts?.alerts || data?.weatherAlerts || [];
  if (!Array.isArray(alerts)) return [];

  return alerts.map((alert) => ({
    id: alert.id || alert.detailsUrl || `${alert.name}-${alert.issuedTime}`,
    name: alert.name || alert.event || "Weather alert",
    description: alert.description || alert.summary || "",
    source: alert.source || "Apple Weather",
    severity: alert.severity || alert.priority || "",
    urgency: alert.urgency || "",
    certainty: alert.certainty || "",
    issued: alert.issuedTime || alert.effectiveTime,
    expires: alert.expireTime || alert.expiresTime,
    url: alert.detailsUrl,
  }));
}
