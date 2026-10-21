import { useEffect, useMemo } from "react";
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
import LifestyleStrip from "@/components/forecast/LifestyleStrip";
import MoreShortcuts from "@/components/forecast/MoreShortcuts";
import NotifyBanners from "@/components/forecast/NotifyBanners";
import { skyTheme } from "@/lib/weather/skyTheme";
import useTabPageMemory from "@/hooks/useTabPageMemory";
import useUnifiedWeather from "@/hooks/useUnifiedWeather";
import { isMissingWeatherKit } from "@/lib/api/unifiedWeather";
import { fetchPointAlerts } from "@/lib/api/outlook";
import useWeatherEmergency from "@/hooks/useWeatherEmergency";
import SafetyTextActions from "@/components/safety/SafetyTextActions";

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
  useTabPageMemory("More");
  const {
    coords,
    locationError,
    locationLoading,
    retry,
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useUnifiedWeather();

  const alertsQuery = useQuery({
    queryKey: ["point-alerts", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords),
    staleTime: 120000,
    queryFn: () => fetchPointAlerts(coords.latitude, coords.longitude),
  });

  const alerts = useMemo(() => {
    const nws = alertsQuery.data?.alerts?.length ? alertsQuery.data.alerts : adaptNwsAlerts(alertsQuery.data);
    const kit = data?.alerts || [];
    const seen = new Set();
    return [...nws, ...kit].filter((alert) => {
      const key = alert.name + (alert.issued || "");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [alertsQuery.data, data?.alerts]);

  const emergency = useWeatherEmergency(alerts);
  const showLoading = locationLoading || (Boolean(coords) && isLoading && !data);
  const current = data?.current?.current;
  const scene = skyTheme({
    weatherCode: current?.weather_code,
    conditionCode: current?.condition_code,
    daylight: current?.daylight,
    precipitationIntensity: current?.precipitation_intensity,
  });

  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (!id || showLoading) return undefined;
    const node = document.getElementById(id);
    if (!node) return undefined;
    node.scrollIntoView({ block: "start" });
    return undefined;
  }, [showLoading, data, alerts]);

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
              {emergency.visible && (
                <section className="rounded-2xl border border-red-500/30 bg-red-950/40 p-3">
                  <p className="mb-2 text-xs text-red-100">
                    {emergency.recent
                      ? "A recent weather emergency was in this area. One tap opens Messages. You still tap Send."
                      : "Weather emergency in this area. One tap opens Messages. You still tap Send."}
                  </p>
                  <SafetyTextActions compact />
                </section>
              )}
              {data && (
                <div
                  className="h-2 rounded-full"
                  style={{ background: scene.background }}
                  aria-hidden="true"
                  data-sky={scene.name}
                />
              )}
              <NotifyBanners coords={coords} />
              <WeatherAlertsCard alerts={alerts} />
              <CurrentConditionsCard data={data.current} />
              <LifestyleStrip current={current} coords={coords} />
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
              <div id="hourly" className="scroll-mt-24">
                <HourlyStrip hours={data.hourly} />
              </div>
              <div id="daily" className="scroll-mt-24">
                <DailyList days={data.daily} />
              </div>
              <MoreShortcuts />
              <HubLinks />
            </>
          )}
        </div>
      </div>

      <BottomTab />
    </div>
  );
}
