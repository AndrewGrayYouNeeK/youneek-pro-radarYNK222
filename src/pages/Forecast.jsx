import { useQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import AppHeader from "@/components/mobile/AppHeader";
import BottomTab from "@/components/radar/BottomTab";
import CurrentConditionsCard from "@/components/forecast/CurrentConditionsCard";
import DailyList from "@/components/forecast/DailyList";
import HourlyStrip from "@/components/forecast/HourlyStrip";
import EnvironmentCards from "@/components/forecast/EnvironmentCards";
import MinutePrecipitation from "@/components/forecast/MinutePrecipitation";
import WeatherAlertsCard from "@/components/forecast/WeatherAlertsCard";
import WeatherKitSetupNotice from "@/components/forecast/WeatherKitSetupNotice";
import useTabPageMemory from "@/hooks/useTabPageMemory";
import useWeatherLocation from "@/hooks/useWeatherLocation";
import { fetchWeatherKit, WeatherKitNotConfiguredError } from "@/lib/api/weatherkit";
import {
  adaptWeatherKitAlerts,
  adaptWeatherKitCurrent,
  adaptWeatherKitDaily,
  adaptWeatherKitHourly,
  adaptWeatherKitNextHour,
} from "@/lib/weather/weatherkit-adapters";

export default function Forecast() {
  useTabPageMemory("Forecast");
  const { coords, error: locationError, loading: locationLoading, retry } = useWeatherLocation();

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["weatherkit", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords),
    staleTime: 300000,
    refetchInterval: 600000,
    queryFn: () => fetchWeatherKit(coords.latitude, coords.longitude),
  });

  const showLoading = locationLoading || (Boolean(coords) && isLoading && !data);

  return (
    <div className="flex h-[100dvh] flex-col bg-slate-950">
      <AppHeader title="Forecast" />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-28">
        <div className="mx-auto flex max-w-md flex-col gap-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Powered by Apple WeatherKit</p>
            {isFetching && !showLoading && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                <LoaderCircle className="h-3 w-3 animate-spin" aria-hidden="true" />
                Updating
              </span>
            )}
          </div>

          {showLoading && (
            <div className="flex items-center justify-center rounded-3xl border border-white/10 bg-white/5 py-16">
              <LoaderCircle className="h-6 w-6 animate-spin text-sky-300" aria-hidden="true" />
            </div>
          )}

          {!showLoading && locationError && (
            <WeatherKitSetupNotice type="location" message={locationError} onRetry={retry} />
          )}

          {!showLoading && !locationError && error instanceof WeatherKitNotConfiguredError && (
            <WeatherKitSetupNotice type="not-configured" message={error.hint} />
          )}

          {!showLoading && !locationError && error && !(error instanceof WeatherKitNotConfiguredError) && (
            <WeatherKitSetupNotice
              type="error"
              message={error.message}
              onRetry={() => refetch()}
            />
          )}

          {!showLoading && !locationError && !error && data && (
            <>
              <WeatherAlertsCard alerts={adaptWeatherKitAlerts(data)} />
              <CurrentConditionsCard data={adaptWeatherKitCurrent(data)} />
              <MinutePrecipitation minutes={adaptWeatherKitNextHour(data)} />
              <EnvironmentCards coords={coords} />
              <HourlyStrip hours={adaptWeatherKitHourly(data)} />
              <DailyList days={adaptWeatherKitDaily(data)} />
            </>
          )}
        </div>
      </div>

      <BottomTab />
    </div>
  );
}
