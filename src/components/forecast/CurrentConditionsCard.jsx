import { describeWeatherCode, degToCardinal } from "@/lib/weather/conditions";
import { formatPrecip, formatPressure, formatTemp, formatWind, tempSuffix } from "@/lib/weather/units";
import { useUnits } from "@/lib/UnitsContext";

function clock(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function trendLabel(value) {
  if (!value) return "";
  const words = String(value).replace(/([A-Z])/g, " $1").trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export default function CurrentConditionsCard({ data }) {
  const { units } = useUnits();
  if (!data) return null;

  const current = data.current || {};
  const daily = data.daily || {};
  const code = describeWeatherCode(current.weather_code);
  const Icon = code.icon;
  const trend = trendLabel(current.pressure_trend);
  const pressure = current.pressure_msl != null ? formatPressure(current.pressure_msl, units.pressure) : "—";
  const stats = [
    ["Gusts", current.wind_gusts_10m != null ? formatWind(current.wind_gusts_10m, units.wind) : "—"],
    ["Humidity", current.relative_humidity_2m != null ? `${Math.round(current.relative_humidity_2m)}%` : "—"],
    ["Dew point", current.dew_point != null ? formatTemp(current.dew_point, units.temp) : "—"],
    ["UV", current.uv_index != null ? String(Math.round(current.uv_index)) : "—"],
    ["Visibility", current.visibility_mi != null ? `${Math.round(current.visibility_mi)} mi` : "—"],
    ["Pressure", trend ? `${pressure} · ${trend}` : pressure],
    ["Clouds", current.cloud_cover != null ? `${Math.round(current.cloud_cover)}%` : "—"],
    ["Rain rate", current.precipitation_intensity != null ? `${formatPrecip(current.precipitation_intensity, units.precip)}/hr` : "—"],
    ["Sunrise", clock(daily.sunrise?.[0])],
    ["Sunset", clock(daily.sunset?.[0])],
  ];

  return (
    <div className="relative min-h-80 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Current Conditions
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-6xl font-extralight leading-none tabular-nums text-white">
              {formatTemp(current.temperature_2m, units.temp).replace("°", "")}°
            </span>
            <span className="text-base text-slate-400">{tempSuffix(units.temp)}</span>
          </div>
          <div className="mt-1 text-sm text-slate-200">{current.condition_label || code.label}</div>
          <div className="text-xs text-slate-400">
            Feels like {formatTemp(current.apparent_temperature, units.temp)}
            {current.daylight === false ? " · Night" : ""}
          </div>
        </div>
        <Icon className="h-20 w-20 text-sky-300/80" strokeWidth={1.4} aria-hidden="true" />
      </div>

      <div className="relative mt-5 grid grid-cols-3 gap-3 text-xs">
        <Stat label="High" value={formatTemp(daily.temperature_2m_max?.[0], units.temp)} />
        <Stat label="Low" value={formatTemp(daily.temperature_2m_min?.[0], units.temp)} />
        <Stat
          label="Wind"
          value={`${formatWind(current.wind_speed_10m, units.wind)} ${degToCardinal(current.wind_direction_10m)}`}
        />
      </div>
      <div className="relative mt-3 grid grid-cols-2 gap-2 text-xs">
        {stats.map(([label, value]) => (
          <Stat key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-1 font-medium text-white">{value}</div>
    </div>
  );
}
