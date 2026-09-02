import { useQuery } from "@tanstack/react-query";
import AppHeader from "@/components/mobile/AppHeader";
import BottomTab from "@/components/radar/BottomTab";
import WeatherAlertsCard from "@/components/forecast/WeatherAlertsCard";
import StormRiskCard from "@/components/forecast/StormRiskCard";
import LocationPicker from "@/components/forecast/LocationPicker";
import useTabPageMemory from "@/hooks/useTabPageMemory";
import useWeatherLocation from "@/hooks/useWeatherLocation";
import { fetchPointAlerts, fetchActiveStorms } from "@/lib/api/outlook";

function adaptNwsAlerts(payload) {
  return (payload?.features || []).map((feature) => {
    const properties = feature.properties || {};
    return {
      id: feature.id || properties.id,
      name: properties.event || properties.headline || "Weather alert",
      description: properties.description || properties.headline || "",
      source: properties.senderName || "NWS",
      severity: properties.severity,
      urgency: properties.urgency,
      issued: properties.sent,
      expires: properties.expires,
    };
  });
}

export default function Briefing() {
  useTabPageMemory("Forecast");
  const { coords } = useWeatherLocation();
  const alertsQuery = useQuery({
    queryKey: ["briefing-alerts", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords),
    queryFn: () => fetchPointAlerts(coords.latitude, coords.longitude),
  });
  const stormsQuery = useQuery({
    queryKey: ["briefing-storms"],
    queryFn: fetchActiveStorms,
  });

  const storms = stormsQuery.data?.activeStorms || stormsQuery.data?.currentStorms || [];

  return (
    <div className="flex h-[100dvh] flex-col bg-slate-950">
      <AppHeader title="Weather Briefing" />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-28">
        <div className="mx-auto flex max-w-md flex-col gap-5">
          <LocationPicker />
          <WeatherAlertsCard alerts={adaptNwsAlerts(alertsQuery.data)} />
          <StormRiskCard coords={coords} />
          <section className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Tropical desk
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              {storms.length
                ? `${storms.length} active NHC system${storms.length === 1 ? "" : "s"}`
                : "No active NHC tropical cyclones."}
            </p>
          </section>
          <section className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-relaxed text-slate-300">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Safety desk
            </h2>
            <p className="mt-2">
              Official NWS watches and warnings, SPC convective outlooks, and NHC storm positions
              stay unlocked. Use Contacts to draft Emergency or I&apos;m Safe texts when a warning
              is nearby.
            </p>
          </section>
        </div>
      </div>
      <BottomTab />
    </div>
  );
}
