import { useMemo } from "react";
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
import LocationPicker from "@/components/forecast/LocationPicker";
import StormRiskCard from "@/components/forecast/StormRiskCard";
import WinterCard from "@/components/forecast/WinterCard";
import HistoricalCard from "@/components/forecast/HistoricalCard";
import PrecipOutlookCard from "@/components/forecast/PrecipOutlookCard";
import LightningProximityCard from "@/components/forecast/LightningProximityCard";
import HubLinks from "@/components/forecast/HubLinks";
import useTabPageMemory from "@/hooks/useTabPageMemory";
import useWeatherLocation from "@/hooks/useWeatherLocation";
import { fetchUnifiedWeather, isMissingWeatherKit } from "@/lib/api/unifiedWeather";
import { fetchPointAlerts } from "@/lib/api/outlook";

function adaptNwsAlerts(payload) {
  return (payload?.features || []).map((feature) => {
    const properties = feature.properties || {};
    return {
      id: feature.id || properties.id,
      name: properties.event || properties.headline || "Weather alert",
      description: properties.headline || properties.description || "",
      source: properties.senderName || "NWS",
      severity: properties.severity,
      urgency: properties.urgency,
      certainty: properties.certainty,
      issued: properties.sent || properties.effective,
      expires: properties.expires || properties.ends,
      url: properties.id,
    };
  });
}

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
    queryKey: ["unified-weather", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords),
    staleTime: 180000,
    refetchInterval: 600000,
    queryFn: () => fetchUnifiedWeather(coords.latitude, coords.longitude),
  });

  const alertsQuery = useQuery({
    queryKey: ["point-alerts", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords),
    staleTime: 120000,
    queryFn: () => fetchPointAlerts(coords.latitude, coords.longitude),
  });

  const alerts = useMemo(() => {
    const nws = adaptNwsAlerts(alertsQuery.data);
    const kit = data?.alerts || [];
    const seen = new Set();
    return [...nws, ...kit].filter((alert) => {
      const key = alert.name + (alert.issued || "");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [alertsQuery.data, data?.alerts]);

  const showLoading = locationLoading || (Boolean(coords) && isLoading && !data);

  return (
    <div className="flex h-[100dvh] flex-col bg-slate-950">
      <AppHeader title="Forecast" />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-28">
        <div className="mx-auto flex max-w-md flex-col gap-5">
          <LocationPicker />
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {data?.source === "weatherkit"
                ? "Apple WeatherKit + Open-Meteo extras · all layers included"
                : "Open-Meteo + NWS · WeatherBug-class features included"}
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

          {!showLoading && locationError && (
            <WeatherKitSetupNotice type="location" message={locationError} onRetry={retry} />
          )}

          {!showLoading && !locationError && error && (
            <WeatherKitSetupNotice
              type="error"
              message={error.message}
              onRetry={() => refetch()}
            />
          )}

          {!showLoading && !locationError && !error && data && (
            <>
              {isMissingWeatherKit(data.weatherkitError) && (
                <p className="text-[11px] text-slate-500">
                  WeatherKit credentials are optional. Full forecast, future radar, and 16-day outlook still load.
                </p>
              )}
              <WeatherAlertsCard alerts={alerts} />
              <CurrentConditionsCard data={data.current} />
              <LightningProximityCard coords={coords} />
              <PrecipOutlookCard extras={data.extras} />
              <MinutePrecipitation minutes={data.minutes} />
              <StormRiskCard coords={coords} />
              <EnvironmentCards coords={coords} />
              <WinterCard extras={data.extras} />
              <HistoricalCard
                extras={data.extras}
                todayHigh={data.daily?.[0]?.high}
                todayLow={data.daily?.[0]?.low}
              />
              <HourlyStrip hours={data.hourly} />
              <DailyList days={data.daily} />
              <HubLinks />
            </>
          )}
        </div>
      </div>

      <BottomTab />
    </div>
  );
}
