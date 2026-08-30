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
import LifestyleStrip from "@/components/forecast/LifestyleStrip";
import MoreShortcuts from "@/components/forecast/MoreShortcuts";
import NotifyBanners from "@/components/forecast/NotifyBanners";
import LocationSearch from "@/components/location/LocationSearch";
import useTabPageMemory from "@/hooks/useTabPageMemory";
import useWeatherLocation from "@/hooks/useWeatherLocation";
import { fetchWeatherKit } from "@/lib/api/weatherkit";
import { fetchEnvironment } from "@/lib/api/environment";
import { fetchNwsPointAlerts, fetchOpenMeteo } from "@/lib/api/openMeteo";
import {
  adaptWeatherKitAlerts,
  adaptWeatherKitCurrent,
  adaptWeatherKitDaily,
  adaptWeatherKitHourly,
  adaptWeatherKitNextHour,
} from "@/lib/weather/weatherkit-adapters";
import {
  adaptOpenMeteoCurrent,
  adaptOpenMeteoDaily,
  adaptOpenMeteoHourly,
  adaptOpenMeteoNextHour,
} from "@/lib/weather/openmeteo-adapters";

function uniqueAlerts(alerts) {
  const seen = new Set();
  return alerts.filter((alert) => {
    const key = alert.id || `${alert.name}-${alert.issued}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function loadForecast(latitude, longitude) {
  const extrasPromise = Promise.allSettled([
    fetchOpenMeteo(latitude, longitude),
    fetchNwsPointAlerts(latitude, longitude),
    fetchEnvironment({ latitude, longitude }),
  ]);

  try {
    const weatherkit = await fetchWeatherKit(latitude, longitude);
    const extras = await extrasPromise;
    return {
      source: "weatherkit",
      current: adaptWeatherKitCurrent(weatherkit),
      hourly: adaptWeatherKitHourly(weatherkit),
      daily: adaptWeatherKitDaily(weatherkit),
      minutes: adaptWeatherKitNextHour(weatherkit),
      alerts: uniqueAlerts([
        ...adaptWeatherKitAlerts(weatherkit),
        ...(extras[1].status === "fulfilled" ? extras[1].value : []),
      ]),
      openMeteo: extras[0].status === "fulfilled" ? extras[0].value : null,
      environment: extras[2].status === "fulfilled" ? extras[2].value : null,
    };
  } catch {
    const extras = await extrasPromise;
    if (extras[0].status !== "fulfilled") {
      throw extras[0].reason || new Error("Forecast unavailable");
    }
    const openMeteo = extras[0].value;
    return {
      source: "open-meteo",
      current: adaptOpenMeteoCurrent(openMeteo),
      hourly: adaptOpenMeteoHourly(openMeteo),
      daily: adaptOpenMeteoDaily(openMeteo),
      minutes: adaptOpenMeteoNextHour(openMeteo),
      alerts: uniqueAlerts(extras[1].status === "fulfilled" ? extras[1].value : []),
      openMeteo,
      environment: extras[2].status === "fulfilled" ? extras[2].value : null,
    };
  }
}

export default function Forecast() {
  useTabPageMemory("Forecast");
  const { coords, error: locationError, loading: locationLoading, retry, setLocation } = useWeatherLocation();

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["forecast-bundle", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords),
    staleTime: 300000,
    refetchInterval: 600000,
    queryFn: () => loadForecast(coords.latitude, coords.longitude),
  });

  const showLoading = locationLoading || (Boolean(coords) && isLoading && !data);
  const todayRain = data?.openMeteo?.daily?.precipitation_sum?.[0];

  return (
    <div className="flex h-[100dvh] flex-col bg-slate-950">
      <AppHeader title="Forecast" />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-28">
        <div className="mx-auto flex max-w-md flex-col gap-5">
          <LocationSearch current={coords} onSelect={setLocation} />

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {data?.source === "weatherkit"
                ? "Powered by Apple WeatherKit + Open-Meteo extras"
                : "Live forecast via Open-Meteo · all Pro layers included"}
            </p>
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

          {!showLoading && locationError && !data && (
            <WeatherKitSetupNotice type="location" message={locationError} onRetry={retry} />
          )}

          {!showLoading && !data && error && (
            <WeatherKitSetupNotice
              type="error"
              message={error.message}
              onRetry={() => refetch()}
            />
          )}

          {!showLoading && data && (
            <>
              {locationError && (
                <p className="text-[11px] text-amber-200/80">{locationError}</p>
              )}
              <NotifyBanners coords={coords} environment={data.environment} />
              <WeatherAlertsCard alerts={data.alerts} />
              <CurrentConditionsCard data={data.current} extras={{ todayRain }} />
              <MinutePrecipitation minutes={data.minutes} />
              <EnvironmentCards coords={coords} />
              <LifestyleStrip current={data.current?.current} environment={data.environment} />
              <HourlyStrip hours={data.hourly} />
              <DailyList days={data.daily} />
              <MoreShortcuts />
            </>
          )}
        </div>
      </div>

      <BottomTab />
    </div>
  );
}
