import { Link } from "react-router-dom";
import { ChevronRight, Loader2, MapPin } from "lucide-react";
import { describeWeatherCode, degToCardinal, formatHourTime } from "@/lib/weather/conditions";
import { formatTemp, formatWind, tempSuffix } from "@/lib/weather/units";
import { useUnits } from "@/lib/UnitsContext";
import useUnifiedWeather from "@/hooks/useUnifiedWeather";

export default function HeroWeather() {
  const { units } = useUnits();
  const {
    current,
    today,
    hourly,
    source,
    isLoading,
    isFetching,
    error,
    locationError,
    locationLoading,
    label,
    coords,
    retry,
    refetch,
  } = useUnifiedWeather();

  const waiting = locationLoading || (Boolean(coords) && isLoading && !current);
  const code = describeWeatherCode(current?.weather_code);
  const Icon = code.icon;
  const weatherError = locationError || (!current && error?.message) || "";
  const nextHours = hourly.slice(0, 8);

  return (
    <div className="relative z-[70] w-full border border-[#00ff9c]/30 bg-black/85 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 border-b border-[#00ff9c]/20 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#00ff9c]">
          <MapPin className="h-3 w-3 shrink-0 text-[#ff00d4]" />
          <span className="truncate">{label || "Live conditions"}</span>
        </div>
        <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
          {source === "weatherkit" ? "WeatherKit" : source === "open-meteo" ? "Open-Meteo" : "WX"}
          {isFetching && !waiting ? " · …" : ""}
        </span>
      </div>

      {waiting && (
        <div className="flex items-center gap-2 px-4 py-8 text-[10px] uppercase tracking-[0.25em] text-[#00ff9c]/70">
          <Loader2 className="h-4 w-4 animate-spin" /> Locking live weather…
        </div>
      )}

      {!waiting && weatherError && (
        <div className="space-y-3 px-4 py-5">
          <p className="text-sm text-[#ffea00]">{weatherError}</p>
          <button
            type="button"
            onClick={() => (locationError ? retry() : refetch())}
            className="text-[10px] uppercase tracking-[0.25em] text-[#00ff9c] hover:text-white"
          >
            {locationError ? "Use my GPS" : "Retry weather"}
          </button>
        </div>
      )}

      {!waiting && !weatherError && current && (
        <div className="px-4 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-bold leading-none tabular-nums text-white md:text-7xl">
                  {formatTemp(current.temperature_2m, units.temp).replace("°", "")}°
                </span>
                <span className="text-sm text-white/50">{tempSuffix(units.temp)}</span>
              </div>
              <div className="mt-2 text-base text-white/85">{current.condition_label || code.label}</div>
              <div className="mt-1 text-xs text-white/50">
                Feels {formatTemp(current.apparent_temperature, units.temp)}
                {" · "}
                H {formatTemp(today?.temperature_2m_max?.[0], units.temp)}
                {" / L "}
                {formatTemp(today?.temperature_2m_min?.[0], units.temp)}
              </div>
              <div className="mt-1 text-xs text-white/40">
                Wind {formatWind(current.wind_speed_10m, units.wind)} {degToCardinal(current.wind_direction_10m)}
                {current.relative_humidity_2m != null && ` · Humidity ${Math.round(current.relative_humidity_2m)}%`}
              </div>
            </div>
            <Icon className="h-16 w-16 shrink-0 text-[#00ff9c] md:h-20 md:w-20" strokeWidth={1.3} aria-hidden="true" />
          </div>

          {nextHours.length > 0 && (
            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.3em] text-[#ff00d4]">
                // Next_8_hours
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {nextHours.map((hour) => {
                  const hourCode = describeWeatherCode(hour.weather_code);
                  const HourIcon = hourCode.icon;
                  return (
                    <div
                      key={hour.time}
                      className="min-w-[3.5rem] border border-white/10 bg-black/50 px-2 py-2 text-center"
                    >
                      <div className="text-[9px] uppercase tracking-wider text-white/40">{formatHourTime(hour.time)}</div>
                      <HourIcon className="mx-auto my-1.5 h-3.5 w-3.5 text-[#00ff9c]/80" aria-hidden="true" />
                      <div className="text-sm font-semibold tabular-nums text-white">
                        {formatTemp(hour.temperature, units.temp)}
                      </div>
                      <div className="text-[9px] text-[#00ff9c]/70">{hour.pop}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <Link
            to="/Forecast"
            className="mt-4 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.25em] text-[#00ff9c] hover:text-white"
          >
            Full forecast desk
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
