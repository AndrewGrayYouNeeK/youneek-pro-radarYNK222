import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  CloudSun,
  Sun,
} from "lucide-react";

export const WMO_CODES = {
  0: { label: "Clear", icon: Sun },
  1: { label: "Mostly Clear", icon: Sun },
  2: { label: "Partly Cloudy", icon: CloudSun },
  3: { label: "Overcast", icon: Cloud },
  45: { label: "Fog", icon: CloudFog },
  48: { label: "Rime Fog", icon: CloudFog },
  51: { label: "Light Drizzle", icon: CloudDrizzle },
  53: { label: "Drizzle", icon: CloudDrizzle },
  55: { label: "Heavy Drizzle", icon: CloudDrizzle },
  61: { label: "Light Rain", icon: CloudRain },
  63: { label: "Rain", icon: CloudRain },
  65: { label: "Heavy Rain", icon: CloudRainWind },
  71: { label: "Light Snow", icon: CloudSnow },
  73: { label: "Snow", icon: CloudSnow },
  75: { label: "Heavy Snow", icon: CloudSnow },
  77: { label: "Snow Grains", icon: CloudSnow },
  80: { label: "Showers", icon: CloudRain },
  81: { label: "Heavy Showers", icon: CloudRainWind },
  82: { label: "Violent Showers", icon: CloudRainWind },
  85: { label: "Snow Showers", icon: CloudSnow },
  86: { label: "Heavy Snow Showers", icon: CloudSnow },
  95: { label: "Thunderstorm", icon: CloudLightning },
  96: { label: "Thunderstorm w/ Hail", icon: CloudLightning },
  99: { label: "Severe Thunderstorm", icon: CloudLightning },
};

export function describeWeatherCode(code) {
  return WMO_CODES[code] || { label: "Unknown", icon: Cloud };
}

export function degToCardinal(deg) {
  if (!Number.isFinite(deg)) return "—";
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

export function formatConditionCode(code) {
  if (!code) return "—";
  return code.replace(/([A-Z])/g, " $1").trim();
}

export function formatHourTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "numeric" });
}

export function formatDayLabel(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}
