import { Link } from "react-router-dom";
import { ChevronRight, Loader2, MapPin } from "lucide-react";
import { describeWeatherCode, degToCardinal } from "@/lib/weather/conditions";
import { formatTemp, formatWind, tempSuffix } from "@/lib/weather/units";
import { useUnits } from "@/lib/UnitsContext";
import useUnifiedWeather from "@/hooks/useUnifiedWeather";

export default function HeroWeather() {
  const { units } = useUnits();
  const {
    current,
    today,
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

  return (
    <div className="relative z-[70] mb-8 max-w-md border border-[#00ff9c]/30 bg-black/80 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-[#00ff9c]/20 px-4 py-2">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.28em] text-[#00ff9c]">
          <MapPin className="h-3 w-3 text-[#ff00d4]" />
          {label || "Live conditions"}
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
          {source === "weatherkit" ? "WeatherKit" : source === "open-meteo" ? "Open-Meteo" : "WX"}
          {isFetching && !waiting ? " · …" : ""}
        </span>
      </div>

      {waiting && (
        <div className="flex items-center gap-2 px-4 py-6 text-[10px] uppercase tracking-[0.25em] text-[#00ff9c]/70">
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
        <div className="px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-bold leading-none tabular-nums text-white">
                  {formatTemp(current.temperature_2m, units.temp).replace("°", "")}°
                </span>
                <span className="text-sm text-white/50">{tempSuffix(units.temp)}</span>
              </div>
              <div className="mt-1 text-sm text-white/80">{current.condition_label || code.label}</div>
              <div className="mt-1 text-[11px] text-white/50">
                Feels {formatTemp(current.apparent_temperature, units.temp)}
                {" · "}
                H {formatTemp(today?.temperature_2m_max?.[0], units.temp)}
                {" / L "}
                {formatTemp(today?.temperature_2m_min?.[0], units.temp)}
              </div>
              <div className="mt-1 text-[11px] text-white/40">
                Wind {formatWind(current.wind_speed_10m, units.wind)} {degToCardinal(current.wind_direction_10m)}
                {current.relative_humidity_2m != null && ` · Humidity ${Math.round(current.relative_humidity_2m)}%`}
              </div>
            </div>
            <Icon className="h-16 w-16 shrink-0 text-[#00ff9c]" strokeWidth={1.3} aria-hidden="true" />
          </div>

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
