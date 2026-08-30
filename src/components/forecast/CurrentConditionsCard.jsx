import { describeWeatherCode, degToCardinal } from "@/lib/weather/conditions";
import { formatPrecip, formatPressure, formatTemp, formatTempShort, formatVisibility, formatWind } from "@/lib/units";
import { useUnits } from "@/lib/UnitsContext";
import { getMoonPhase } from "@/lib/weather/moon";

export default function CurrentConditionsCard({ data, extras }) {
  const { units } = useUnits();
  if (!data) return null;

  const current = data.current || {};
  const daily = data.daily || {};
  const code = describeWeatherCode(current.weather_code);
  const Icon = code.icon;
  const trend = current.pressure_trend
    ? String(current.pressure_trend).replace(/([A-Z])/g, " $1").trim()
    : "";
  const moon = getMoonPhase();
  const todayRain = extras?.todayRain ?? daily.precipitation_sum?.[0];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Current Conditions
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-6xl font-extralight leading-none tabular-nums text-white">
              {formatTempShort(current.temperature_2m, units)}
            </span>
            <span className="text-base text-slate-400">{units.temp === "C" ? "C" : "F"}</span>
          </div>
          <div className="mt-1 text-sm text-slate-200">{current.condition_label || code.label}</div>
          <div className="text-xs text-slate-400">
            Feels like {formatTempShort(current.apparent_temperature, units)}
            {current.daylight === false ? " · Night" : ""}
          </div>
        </div>
        <Icon className="h-20 w-20 text-sky-300/80" strokeWidth={1.4} aria-hidden="true" />
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
        <Stat label="High" value={formatTemp(daily.temperature_2m_max?.[0], units)} />
        <Stat label="Low" value={formatTemp(daily.temperature_2m_min?.[0], units)} />
        <Stat
          label="Wind"
          value={`${formatWind(current.wind_speed_10m, units)} ${degToCardinal(current.wind_direction_10m)}`}
        />
        <Stat label="Gusts" value={formatWind(current.wind_gusts_10m, units)} />
        <Stat label="Humidity" value={`${Math.round(current.relative_humidity_2m ?? 0)}%`} />
        <Stat label="Dew point" value={formatTemp(current.dew_point, units)} />
        <Stat label="UV" value={current.uv_index != null ? String(Math.round(current.uv_index)) : "—"} />
        <Stat label="Visibility" value={formatVisibility(current.visibility_mi, units)} />
        <Stat
          label="Pressure"
          value={
            current.pressure_msl != null
              ? `${formatPressure(current.pressure_msl, units)}${trend ? ` ${trend}` : ""}`
              : "—"
          }
        />
        <Stat label="Clouds" value={current.cloud_cover != null ? `${current.cloud_cover}%` : "—"} />
        <Stat label="Precip rate" value={formatPrecip(current.precipitation_intensity, units, { suffix: "/hr" })} />
        <Stat
          label="Sun"
          value={
            daily.sunrise?.[0] && daily.sunset?.[0]
              ? `${new Date(daily.sunrise[0]).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}–${new Date(daily.sunset[0]).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
              : "—"
          }
        />
        <Stat label="Today's rain" value={formatPrecip(todayRain, units)} />
        <Stat label="Moon" value={`${moon.emoji} ${moon.name}`} />
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
