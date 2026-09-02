import { Link } from "react-router-dom";
import {
  ChevronRight,
  Cloud,
  Droplets,
  Gauge,
  Loader2,
  MapPin,
  SunMedium,
  Thermometer,
  Wind,
} from "lucide-react";
import { describeWeatherCode, degToCardinal, formatDayLabel, formatHourTime } from "@/lib/weather/conditions";
import { formatPrecip, formatPressure, formatTemp, formatWind, tempSuffix } from "@/lib/weather/units";
import { useUnits } from "@/lib/UnitsContext";
import useUnifiedWeather from "@/hooks/useUnifiedWeather";
import { useLocation } from "./LocationContext";

export default function CurrentConditions() {
  const { units } = useUnits();
  const { location } = useLocation();
  const {
    current,
    today,
    hourly,
    daily,
    extras,
    source,
    isLoading,
    error,
    locationError,
    locationLoading,
    coords,
    retry,
    refetch,
  } = useUnifiedWeather();

  const waiting = locationLoading || (Boolean(coords) && isLoading && !current);
  const code = describeWeatherCode(current?.weather_code);
  const nextHours = hourly.slice(0, 24);
  const nextDays = daily.slice(0, 10);
  const sourceLabel =
    source === "weatherkit" ? "Apple WeatherKit + Open-Meteo" : source === "open-meteo" ? "Open-Meteo + NWS extras" : "Live weather";

  return (
    <section id="conditions" className="relative overflow-hidden border-t border-[#00ff9c]/20 bg-black px-5 py-24 scroll-mt-32 md:px-8">
      <div className="absolute inset-0 [background:radial-gradient(ellipse_at_bottom,rgba(0,255,156,0.08),transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.4em] text-[#00ff9c]">
              // WEATHERBUG_CLASS_FEED
            </div>
            <h2 className="text-4xl font-bold leading-[0.95] tracking-tight text-white md:text-5xl">
              Current <span className="text-[#00ff9c]">Conditions</span>
            </h2>
            <div className="mt-3 flex items-center gap-2 text-sm text-white/60">
              <MapPin className="h-3.5 w-3.5 text-[#ff00d4]" />
              <span>
                {location?.label || "Waiting for GPS…"}
                <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.25em] text-[#00ff9c]">
                  · {sourceLabel}
                </span>
              </span>
            </div>
          </div>
          <Link
            to="/Forecast"
            className="inline-flex items-center gap-2 border border-[#00ff9c]/40 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-[#00ff9c] hover:bg-[#00ff9c]/10"
          >
            Open forecast desk
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {waiting && (
          <div className="flex items-center justify-center py-12 text-xs uppercase tracking-[0.25em] text-[#00ff9c]/70">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Querying live weather…
          </div>
        )}

        {(locationError || (error && !current)) && !waiting && (
          <div className="mb-6 border border-[#ff00d4]/40 bg-[#ff00d4]/5 p-4 text-sm text-[#ff00d4]">
            {locationError || error.message || "Failed to load weather"}
            <button type="button" onClick={locationError ? retry : () => refetch()} className="ml-3 text-[#00ff9c]">
              Retry
            </button>
          </div>
        )}

        {!waiting && current && (
          <>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-6 border border-[#00ff9c]/20 bg-black/60 p-5">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-bold tabular-nums text-white md:text-7xl">
                    {formatTemp(current.temperature_2m, units.temp).replace("°", "")}°
                  </span>
                  <span className="text-lg text-white/50">{tempSuffix(units.temp)}</span>
                </div>
                <div className="mt-2 text-lg text-white">{current.condition_label || code.label}</div>
                <div className="mt-1 text-sm text-white/50">
                  Feels like {formatTemp(current.apparent_temperature, units.temp)}
                  {" · High "}
                  {formatTemp(today?.temperature_2m_max?.[0], units.temp)}
                  {" / Low "}
                  {formatTemp(today?.temperature_2m_min?.[0], units.temp)}
                </div>
              </div>
              <code.icon className="h-20 w-20 text-[#00ff9c]" strokeWidth={1.2} aria-hidden="true" />
            </div>

            <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat icon={Wind} label="Wind" value={formatWind(current.wind_speed_10m, units.wind)} unit={degToCardinal(current.wind_direction_10m)} accent="#00ff9c" />
              <Stat icon={Droplets} label="Humidity" value={current.relative_humidity_2m != null ? Math.round(current.relative_humidity_2m) : "—"} unit="%" accent="#ffea00" />
              <Stat icon={Gauge} label="Pressure" value={formatPressure(current.pressure_msl, units.pressure)} unit="" accent="#00ff9c" />
              <Stat icon={Thermometer} label="Dew point" value={formatTemp(current.dew_point, units.temp)} unit="" accent="#ff00d4" />
              <Stat icon={SunMedium} label="UV" value={current.uv_index != null ? String(Math.round(current.uv_index)) : "—"} unit="" accent="#ffea00" />
              <Stat icon={Cloud} label="Clouds" value={current.cloud_cover != null ? Math.round(current.cloud_cover) : "—"} unit="%" accent="#00ff9c" />
              <Stat
                icon={Droplets}
                label="Precip 24h"
                value={extras?.precip24hIn != null ? formatPrecip(extras.precip24hIn, units.precip) : "—"}
                unit=""
                accent="#ff00d4"
              />
              <Stat
                icon={Wind}
                label="Gusts"
                value={current.wind_gusts_10m != null ? formatWind(current.wind_gusts_10m, units.wind) : "—"}
                unit=""
                accent="#ffea00"
              />
            </div>

            {nextHours.length > 0 && (
              <>
                <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.4em] text-[#ff00d4]">
                  // HOURLY_{Math.min(24, nextHours.length)}
                </div>
                <div className="mb-8 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {nextHours.map((hour) => {
                    const hourCode = describeWeatherCode(hour.weather_code);
                    const HourIcon = hourCode.icon;
                    return (
                      <div key={hour.time} className="min-w-[4.6rem] border border-[#00ff9c]/20 bg-black/60 p-3 text-center">
                        <div className="truncate text-[9px] uppercase tracking-[0.2em] text-[#00ff9c]">{formatHourTime(hour.time)}</div>
                        <HourIcon className="mx-auto my-2 h-4 w-4 text-white/70" aria-hidden="true" />
                        <div className="text-lg font-bold tabular-nums text-white">{formatTemp(hour.temperature, units.temp)}</div>
                        <div className="mt-1 text-[9px] text-white/40">{hour.pop}%</div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {nextDays.length > 0 && (
              <>
                <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.4em] text-[#ff00d4]">
                  // {nextDays.length}_DAY_OUTLOOK
                </div>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-5 lg:grid-cols-10">
                  {nextDays.map((day) => {
                    const dayCode = describeWeatherCode(day.weather_code);
                    const DayIcon = dayCode.icon;
                    return (
                      <div key={day.date} className="border border-[#00ff9c]/20 bg-black/60 p-3">
                        <div className="mb-2 truncate text-[9px] uppercase tracking-[0.2em] text-[#00ff9c]">
                          {formatDayLabel(day.date)}
                        </div>
                        <DayIcon className="mb-2 h-4 w-4 text-white/70" aria-hidden="true" />
                        <div className="text-xl font-bold tabular-nums text-white">
                          {formatTemp(day.high, units.temp)}
                        </div>
                        <div className="text-xs text-white/50">{formatTemp(day.low, units.temp)}</div>
                        <div className="mt-1 line-clamp-2 text-[10px] leading-snug text-white/60">{day.label}</div>
                        <div className="mt-2 font-mono text-[9px] text-white/40">{day.pop}%</div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function Stat({ icon: Icon, label, value, unit, accent }) {
  return (
    <div className="relative border border-white/10 bg-black/60 p-4">
      <span className="absolute left-0 top-0 h-2 w-2 border-l border-t" style={{ borderColor: accent }} />
      <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r" style={{ borderColor: accent }} />
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-3 w-3" style={{ color: accent }} />
        <span className="text-[9px] uppercase tracking-[0.25em] text-white/50">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tabular-nums text-white">{value}</span>
        {unit ? <span className="text-[10px] text-white/50">{unit}</span> : null}
      </div>
    </div>
  );
}
