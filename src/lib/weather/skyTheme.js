export const WEATHERBUG_GOLD = "#FFD400";
export const WEATHERBUG_BLUE = "#1E7BD6";
export const WEATHERBUG_SKY = "#4DA6EA";

/** Apple WeatherKit currentWeather.conditionCode values → home-screen scene. */
export const WEATHERKIT_SCENES = {
  Clear: "clear",
  MostlyClear: "clear",
  Hot: "clear",
  PartlyCloudy: "partly",
  MostlyCloudy: "partly",
  Breezy: "partly",
  Windy: "partly",
  Cloudy: "overcast",
  Fog: "fog",
  Haze: "fog",
  Smoky: "fog",
  BlowingDust: "fog",
  Drizzle: "rain",
  Rain: "rain",
  HeavyRain: "rain",
  Showers: "rain",
  SunShowers: "rain",
  FreezingDrizzle: "rain",
  FreezingRain: "rain",
  Flurries: "snow",
  SunFlurries: "snow",
  Snow: "snow",
  HeavySnow: "snow",
  Blizzard: "snow",
  BlowingSnow: "snow",
  Sleet: "snow",
  WintryMix: "snow",
  Frigid: "snow",
  Hail: "storm",
  Thunderstorms: "storm",
  IsolatedThunderstorms: "storm",
  ScatteredThunderstorms: "storm",
  StrongStorms: "storm",
  Hurricane: "storm",
  TropicalStorm: "storm",
};

const THEMES = {
  storm: {
    name: "storm",
    background: "linear-gradient(180deg, #1B2433 0%, #3D4A5C 42%, #6A7380 100%)",
  },
  snow: {
    name: "snow",
    background: "linear-gradient(180deg, #7A8B9C 0%, #C5D0D8 55%, #E8EEF2 100%)",
  },
  rain: {
    name: "rain",
    background: "linear-gradient(180deg, #4E5D6C 0%, #6E8496 45%, #8FA4B5 100%)",
  },
  fog: {
    name: "fog",
    background: "linear-gradient(180deg, #8A97A3 0%, #B7C0C8 100%)",
  },
  overcast: {
    name: "overcast",
    background: "linear-gradient(180deg, #5B7D9A 0%, #8EADC4 55%, #B9C9D4 100%)",
  },
  partly: {
    name: "partly",
    background: "linear-gradient(180deg, #3B8FD4 0%, #7EB6E8 48%, #C5DFF6 100%)",
  },
  "partly-night": {
    name: "partly-night",
    background: "linear-gradient(180deg, #0F1C3A 0%, #243868 100%)",
  },
  "clear-night": {
    name: "clear-night",
    background: "linear-gradient(180deg, #071428 0%, #16315C 50%, #2A4A7A 100%)",
  },
  clear: {
    name: "clear",
    background: "linear-gradient(180deg, #1E7BD6 0%, #4DA6EA 38%, #87CEFA 72%, #B3E0FF 100%)",
  },
};

const HEAVY_CODES = new Set(["HeavyRain", "HeavySnow", "Blizzard", "StrongStorms", "Hurricane", "Hail"]);
const LIGHT_CODES = new Set(["Drizzle", "Flurries", "SunFlurries", "SunShowers", "MostlyClear"]);

function sceneFromWmo(code) {
  if (code >= 95) return "storm";
  if ((code >= 71 && code < 80) || code >= 85) return "snow";
  if (code >= 51 || (code >= 80 && code < 85)) return "rain";
  if (code === 45 || code === 48) return "fog";
  if (code === 3) return "overcast";
  if (code === 2) return "partly";
  return "clear";
}

function intensityFor({ conditionCode, weatherCode, precipitationIntensity }) {
  const mmh = Number(precipitationIntensity);
  if (Number.isFinite(mmh) && mmh > 0) {
    if (mmh >= 7.6) return "heavy";
    if (mmh >= 2.5) return "medium";
    return "light";
  }
  if (HEAVY_CODES.has(conditionCode) || weatherCode >= 96 || weatherCode === 65 || weatherCode === 75 || weatherCode === 82) {
    return "heavy";
  }
  if (LIGHT_CODES.has(conditionCode) || weatherCode === 51 || weatherCode === 71 || weatherCode === 80) {
    return "light";
  }
  return "medium";
}

export function skyTheme({
  weatherCode = 0,
  conditionCode = "",
  daylight = true,
  precipitationIntensity = 0,
} = {}) {
  const code = Number(weatherCode) || 0;
  const kitId = String(conditionCode || "").trim();
  let scene = WEATHERKIT_SCENES[kitId] || sceneFromWmo(code);

  if (scene === "clear" && !daylight) scene = "clear-night";
  if (scene === "partly" && !daylight) scene = "partly-night";

  const theme = THEMES[scene] || THEMES.clear;
  return {
    ...theme,
    conditionCode: kitId || null,
    intensity: intensityFor({ conditionCode: kitId, weatherCode: code, precipitationIntensity }),
    daylight: daylight !== false,
  };
}

export function weatherIconClass(code) {
  const value = Number(code) || 0;
  if (value <= 1) return "text-yellow-300";
  if (value === 2) return "text-yellow-200";
  if (value >= 95) return "text-yellow-300";
  if ((value >= 71 && value < 80) || value >= 85) return "text-white";
  if (value >= 51) return "text-sky-100";
  return "text-white";
}

export const frostCard =
  "rounded-2xl border border-white/25 bg-white/15 shadow-[0_8px_32px_rgba(15,40,70,0.18)] backdrop-blur-md";
