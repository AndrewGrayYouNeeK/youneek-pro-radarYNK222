import { useEffect } from "react";
import { Link } from "react-router-dom";
import { LoaderCircle, Map } from "lucide-react";
import LocationPicker from "@/components/forecast/LocationPicker";
import CurrentConditionsCard from "@/components/forecast/CurrentConditionsCard";
import HourlyStrip from "@/components/forecast/HourlyStrip";
import DailyList from "@/components/forecast/DailyList";
import MinutePrecipitation, { rainTimingLabel } from "@/components/forecast/MinutePrecipitation";
import EnvironmentCards from "@/components/forecast/EnvironmentCards";
import AlertBanner from "@/components/home/AlertBanner";
import WeatherDetails from "@/components/forecast/WeatherDetails";
import LegacyBrand from "@/components/home/LegacyBrand";
import SafetyReminderCard from "@/components/safety/SafetyReminderCard";
import SafetyTextCard from "@/components/safety/SafetyTextCard";
import useUnifiedWeather from "@/hooks/useUnifiedWeather";
import { fetchPointAlerts } from "@/lib/api/outlook";
import { useQuery } from "@tanstack/react-query";
import { getPref } from "@/lib/prefs";
import { mergeWeatherAlerts } from "@/lib/weather/alertMerge";
import { getMoonPhase } from "@/lib/weather/moon";

export default function WeatherHome() {
  const { coords, locationError, locationLoading, data, isLoading, error, refetch } = useUnifiedWeather();
  const alertsQuery = useQuery({
    queryKey: ["point-alerts", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords),
    staleTime: 120000,
    queryFn: () => fetchPointAlerts(coords.latitude, coords.longitude),
  });
  const alerts = mergeWeatherAlerts(alertsQuery.data?.alerts || [], data?.alerts || []);
  const moon = getMoonPhase();
  const showLoading = locationLoading || (Boolean(coords) && isLoading && !data);

  useEffect(() => {
    if (!alerts.length) return undefined;
    if (!getPref("pref_browserAlerts", false)) return undefined;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return undefined;
    const key = alerts.map((alert) => alert.id || alert.name).join("|");
    if (sessionStorage.getItem("ynk_notified") === key) return undefined;
    sessionStorage.setItem("ynk_notified", key);
    const top = alerts[0];
    try {
      new Notification(top.name || "Weather alert", {
        body: top.description || "Open the briefing for the full alert.",
      });
    } catch {
      /* notification blocked */
    }
    return undefined;
  }, [alerts]);

  return (
    <>
      <LegacyBrand />
      <LocationPicker />
      <AlertBanner alerts={alerts} />
      <SafetyTextCard />
      <SafetyReminderCard />

      {showLoading && (
        <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-6 text-sm text-slate-300">
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading weather…
        </div>
      )}

      {!showLoading && locationError && !data && (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200">
          Search for a city to load WeatherKit conditions. Radar still works without a location.
        </div>
      )}

      {!showLoading && error && !data && (
        <button type="button" onClick={() => refetch()} className="rounded-2xl bg-white/10 px-4 py-4 text-left text-sm text-white">
          Weather did not load. Tap to try again.
        </button>
      )}

      {data && (
        <>
          <CurrentConditionsCard data={data.current} />
          <WeatherDetails data={data} />
          <section className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <h2 className="text-sm font-semibold text-white">{rainTimingLabel(data.minutes)}</h2>
            <div className="mt-3">
              <MinutePrecipitation minutes={data.minutes} hideHeader />
            </div>
          </section>
          <HourlyStrip hours={(data.hourly || []).slice(0, 24)} title="Hourly" />
          <div className="text-right">
            <Link to="/Hourly" className="text-sm font-medium text-sky-300">
              Full hourly
            </Link>
          </div>
          <DailyList days={(data.daily || []).slice(0, 10)} />
          <div className="text-right">
            <Link to="/Daily" className="text-sm font-medium text-sky-300">
              10-day
            </Link>
          </div>
          <Link
            to="/Radar"
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-sky-500/15 px-4 py-4 lg:hidden"
          >
            <div>
              <div className="text-sm font-semibold text-white">Radar map</div>
              <div className="text-xs text-slate-300">Open the full-screen map</div>
            </div>
            <Map className="h-6 w-6 text-sky-300" aria-hidden="true" />
          </Link>
          <EnvironmentCards coords={coords} />
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link to="/Astronomy" className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
              <div className="text-xs text-slate-400">Moon</div>
              <div className="mt-1 font-semibold text-white">
                {moon.emoji} {moon.name}
              </div>
            </Link>
            <Link to="/Hurricanes" className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
              <div className="text-xs text-slate-400">Tropics</div>
              <div className="mt-1 font-semibold text-white">Hurricane tracker</div>
            </Link>
          </div>
          <p className="text-xs text-slate-500">
            {data.source === "weatherkit"
              ? "Conditions from Apple WeatherKit. Open-Meteo fills extra hours."
              : "WeatherKit is unavailable, so this forecast is from Open-Meteo and NWS."}
          </p>
        </>
      )}
    </>
  );
}
