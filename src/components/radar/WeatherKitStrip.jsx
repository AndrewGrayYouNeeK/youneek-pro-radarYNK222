import { useQuery } from "@tanstack/react-query";
import { ChevronRight, LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { describeWeatherCode } from "@/lib/weather/conditions";
import { formatTemp } from "@/lib/weather/units";
import { useUnits } from "@/lib/UnitsContext";
import useUnifiedWeather from "@/hooks/useUnifiedWeather";
import { fetchPointAlerts } from "@/lib/api/outlook";

export default function WeatherKitStrip() {
  const navigate = useNavigate();
  const { units } = useUnits();
  const {
    current,
    hourly,
    source,
    locationError,
    locationLoading,
    isLoading,
    coords,
  } = useUnifiedWeather();

  const alertsQuery = useQuery({
    queryKey: ["point-alerts", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords),
    staleTime: 120000,
    queryFn: () => fetchPointAlerts(coords.latitude, coords.longitude),
  });

  if (locationLoading || (isLoading && coords && !current)) {
    return (
      <div className="border-b border-white/10 bg-slate-950/95 px-4 py-2">
        <div className="mx-auto flex max-w-md items-center gap-2 text-xs text-slate-400">
          <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          Loading live weather…
        </div>
      </div>
    );
  }

  if (locationError || !current) {
    return null;
  }

  const code = describeWeatherCode(current.weather_code);
  const Icon = code.icon;
  const nextHour = hourly[0];
  const alertCount = alertsQuery.data?.features?.length || 0;

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
                {formatTemp(current.temperature_2m, units.temp)}
              </span>
              <span className="truncate text-xs text-slate-400">
                {current.condition_label || code.label}
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              {nextHour
                ? `Next hour ${formatTemp(nextHour.temperature, units.temp)} · ${nextHour.pop}% rain`
                : source === "weatherkit"
                  ? "WeatherKit + Open-Meteo"
                  : "Open-Meteo + NWS"}
              {alertCount > 0 ? ` · ${alertCount} alert${alertCount === 1 ? "" : "s"}` : ""}
            </div>
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
