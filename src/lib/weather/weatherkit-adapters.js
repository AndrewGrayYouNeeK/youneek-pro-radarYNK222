import { formatConditionCode } from "./conditions.js";
import { convertTemperature, convertWindSpeed, isUsCustomary, weatherKitUnitsFrom } from "./weatherkit-units.js";

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

function percent(value) {
  if (value == null || !Number.isFinite(Number(value))) return null;
  const number = Number(value);
  return Math.round(number <= 1 ? number * 100 : number);
}

function measurement(units) {
  const metric = !isUsCustomary(units);
  return {
    temp(value) {
      if (value == null || !Number.isFinite(Number(value))) return null;
      return convertTemperature(Number(value), metric ? "m" : "s");
    },
    wind(value) {
      if (value == null || !Number.isFinite(Number(value))) return null;
      return convertWindSpeed(Number(value), metric ? "m" : "s");
    },
    inches(value) {
      if (value == null || !Number.isFinite(Number(value))) return null;
      return metric ? Number(value) / 25.4 : Number(value);
    },
    miles(value) {
      if (value == null || !Number.isFinite(Number(value))) return null;
      return metric ? Number(value) / 1609.344 : Number(value);
    },
  };
}

const MOON_PHASES = {
  new: "New moon",
  waxingCrescent: "Waxing crescent",
  firstQuarter: "First quarter",
  waxingGibbous: "Waxing gibbous",
  full: "Full moon",
  waningGibbous: "Waning gibbous",
  thirdQuarter: "Last quarter",
  lastQuarter: "Last quarter",
  waningCrescent: "Waning crescent",
};

const PRECIP_TYPES = {
  clear: "None",
  precipitation: "Precipitation",
  rain: "Rain",
  snow: "Snow",
  sleet: "Sleet",
  hail: "Hail",
  mixed: "Wintry mix",
  freezingRain: "Freezing rain",
};

function labelFromCode(value, table) {
  if (!value) return "";
  return table[value] || formatConditionCode(value);
}

function splitWords(value) {
  return String(value || "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();
}

function alertTitle(alert) {
  if (alert?.name || alert?.event) return alert.name || alert.event;
  const phenomenon = splitWords(alert?.phenomenon);
  const significance = splitWords(alert?.significance);
  const combined = [phenomenon, significance].filter(Boolean).join(" ");
  if (combined) return combined;
  const first = String(alert?.description || "").split(/[.\n]/)[0].trim();
  if (first && first.length <= 80) return first;
  return "Weather alert";
}

function attributionUrl(data) {
  return (
    data?.currentWeather?.metadata?.attributionURL ||
    data?.forecastDaily?.metadata?.attributionURL ||
    data?.forecastHourly?.metadata?.attributionURL ||
    data?.weatherAlerts?.metadata?.attributionURL ||
    "https://weatherkit.apple.com/legal-attribution.html"
  );
}

function adaptDayPart(part, scale) {
  if (!part) return null;
  return {
    label: formatConditionCode(part.conditionCode),
    high: scale.temp(part.temperatureMax),
    low: scale.temp(part.temperatureMin),
    pop: popPercent(part.precipitationChance),
    precipType: labelFromCode(part.precipitationType, PRECIP_TYPES),
    snowIn: scale.inches(part.snowfallAmount),
    wind: scale.wind(part.windSpeed),
  };
}

export function adaptWeatherKitCurrent(data) {
  const current = data?.currentWeather;
  const today = data?.forecastDaily?.days?.[0];
  const scale = measurement(weatherKitUnitsFrom(data));
  const humidity = current?.humidity;
  const humidityPct = humidity == null ? 0 : humidity <= 1 ? humidity * 100 : humidity;

  return {
    current: {
      temperature_2m: scale.temp(current?.temperature),
      apparent_temperature: scale.temp(current?.temperatureApparent),
      dew_point: scale.temp(current?.temperatureDewPoint),
      relative_humidity_2m: humidityPct,
      wind_speed_10m: scale.wind(current?.windSpeed),
      wind_direction_10m: current?.windDirection,
      wind_gusts_10m: scale.wind(current?.windGust),
      weather_code: conditionToWmo(current?.conditionCode),
      condition_code: current?.conditionCode || "",
      condition_label: formatConditionCode(current?.conditionCode),
      pressure_msl: current?.pressure,
      pressure_trend: current?.pressureTrend,
      visibility: current?.visibility,
      visibility_mi: scale.miles(current?.visibility),
      uv_index: current?.uvIndex,
      cloud_cover: percent(current?.cloudCover),
      precipitation_intensity: scale.inches(current?.precipitationIntensity),
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
  const scale = measurement(weatherKitUnitsFrom(data));

  return hours.slice(0, 48).map((hour) => ({
    time: hour.forecastStart,
    temperature: Math.round(scale.temp(hour.temperature) ?? 0),
    pop: popPercent(hour.precipitationChance),
    label: formatConditionCode(hour.conditionCode),
    weather_code: conditionToWmo(hour.conditionCode),
    precipType: labelFromCode(hour.precipitationType, PRECIP_TYPES),
  }));
}

export function adaptWeatherKitDaily(data) {
  const days = data?.forecastDaily?.days || [];
  const scale = measurement(weatherKitUnitsFrom(data));

  return days.slice(0, 10).map((day) => ({
    date: day.forecastStart,
    high: Math.round(scale.temp(day.temperatureMax) ?? 0),
    low: Math.round(scale.temp(day.temperatureMin) ?? 0),
    pop: popPercent(day.precipitationChance),
    label: formatConditionCode(day.conditionCode),
    weather_code: conditionToWmo(day.conditionCode),
    precipType: labelFromCode(day.precipitationType, PRECIP_TYPES),
    snowfallIn: scale.inches(day.snowfallAmount),
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
  const bucket = data?.weatherAlerts;
  const alerts = Array.isArray(bucket?.alerts) ? bucket.alerts : Array.isArray(bucket) ? bucket : [];

  return alerts.map((alert) => ({
    id: alert.id || alert.detailsUrl || `${alertTitle(alert)}-${alert.issuedTime}`,
    name: alertTitle(alert),
    description: alert.description || alert.summary || "",
    source: alert.source || "Apple Weather",
    severity: alert.severity || alert.priority || "",
    urgency: alert.urgency || "",
    certainty: alert.certainty || "",
    issued: alert.issuedTime || alert.effectiveTime,
    expires: alert.expireTime || alert.expiresTime || alert.eventEndTime,
    url: alert.detailsUrl,
  }));
}

export function adaptWeatherKitDetails(data) {
  const current = data?.currentWeather || {};
  const today = data?.forecastDaily?.days?.[0] || {};
  const scale = measurement(weatherKitUnitsFrom(data));
  return {
    attributionUrl: attributionUrl(data),
    dewPoint: scale.temp(current.temperatureDewPoint),
    visibilityMi: scale.miles(current.visibility),
    pressure: current.pressure ?? null,
    pressureTrend: current.pressureTrend || "",
    uvIndex: current.uvIndex ?? null,
    windGust: scale.wind(current.windGust),
    cloudCover: percent(current.cloudCover),
    cloudLow: percent(current.cloudCoverLowAltPct),
    cloudMid: percent(current.cloudCoverMidAltPct),
    cloudHigh: percent(current.cloudCoverHighAltPct),
    precipIntensity: scale.inches(current.precipitationIntensity),
    precipType: labelFromCode(today.precipitationType, PRECIP_TYPES),
    snowfallIn: scale.inches(today.snowfallAmount),
    sunrise: today.sunrise || null,
    sunset: today.sunset || null,
    solarNoon: today.solarNoon || null,
    moonPhase: labelFromCode(today.moonPhase, MOON_PHASES),
    moonrise: today.moonrise || null,
    moonset: today.moonset || null,
    daytime: adaptDayPart(today.daytimeForecast, scale),
    overnight: adaptDayPart(today.overnightForecast, scale),
  };
}
