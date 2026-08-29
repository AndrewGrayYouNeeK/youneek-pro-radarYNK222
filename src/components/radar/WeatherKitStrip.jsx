import { useQuery } from "@tanstack/react-query";
import { ChevronRight, LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchWeatherKit, WeatherKitNotConfiguredError } from "@/lib/api/weatherkit";
import {
  adaptWeatherKitCurrent,
  adaptWeatherKitHourly,
} from "@/lib/weather/weatherkit-adapters";
import { describeWeatherCode } from "@/lib/weather/conditions";
import useWeatherLocation from "@/hooks/useWeatherLocation";

export default function WeatherKitStrip() {
  const navigate = useNavigate();
  const { coords, error: locationError, loading: locationLoading } = useWeatherLocation();

  const { data, isLoading, error } = useQuery({
    queryKey: ["weatherkit", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords),
    staleTime: 300000,
    refetchInterval: 600000,
    queryFn: () => fetchWeatherKit(coords.latitude, coords.longitude),
  });

  if (locationLoading || (isLoading && coords)) {
    return (
      <div className="border-b border-white/10 bg-slate-950/95 px-4 py-2">
        <div className="mx-auto flex max-w-md items-center gap-2 text-xs text-slate-400">
          <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          Loading Apple WeatherKit…
        </div>
      </div>
    );
  }

  if (locationError) {
    return null;
  }

  if (error instanceof WeatherKitNotConfiguredError) {
    return (
      <button
        type="button"
        onClick={() => navigate("/Forecast")}
        className="w-full border-b border-amber-400/20 bg-amber-950/40 px-4 py-2 text-left transition-colors hover:bg-amber-950/55"
      >
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-amber-100">Connect Apple WeatherKit</div>
            <div className="truncate text-[11px] text-amber-100/70">Tap to set up forecasts</div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-amber-100/70" aria-hidden="true" />
        </div>
      </button>
    );
  }

  if (error || !data) {
    return null;
  }

  const current = adaptWeatherKitCurrent(data);
  const nextHour = adaptWeatherKitHourly(data)[0];
  const code = describeWeatherCode(current.current.weather_code);
  const Icon = code.icon;

  return (
    <button
      type="button"
      onClick={() => navigate("/Forecast")}
      className="w-full border-b border-white/10 bg-slate-950/95 px-4 py-2 text-left transition-colors hover:bg-white/5"
    >
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Icon className="h-5 w-5 shrink-0 text-sky-300" aria-hidden="true" />
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold tabular-nums text-white">
                {Math.round(current.current.temperature_2m ?? 0)}°
              </span>
              <span className="truncate text-xs text-slate-400">
                {current.current.condition_label || code.label}
              </span>
            </div>
            {nextHour && (
              <div className="text-[11px] text-slate-500">
                Next hour {nextHour.temperature}° · {nextHour.pop}% rain
              </div>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-sky-300">
          Forecast
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>
    </button>
  );
}
