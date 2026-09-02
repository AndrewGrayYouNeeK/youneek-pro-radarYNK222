import { useQuery } from "@tanstack/react-query";
import { getPref } from "@/lib/prefs";
import { haversineMiles } from "@/lib/globe/math";

export default function NotifyBanners({ coords, environment }) {
  const { data: lightning } = useQuery({
    queryKey: ["lightning"],
    staleTime: 60000,
    queryFn: async () => (await fetch("/api/lightning")).json(),
  });
  const { data: storms } = useQuery({
    queryKey: ["activeStorms"],
    staleTime: 120000,
    queryFn: async () => (await fetch("/api/getActiveStorms")).json(),
  });

  const banners = [];
  if (getPref("pref_notifyLightning", true) && coords && lightning?.strikes?.length) {
    const nearest = lightning.strikes
      .map((strike) => haversineMiles(coords.latitude, coords.longitude, strike.lat, strike.lon))
      .sort((a, b) => a - b)[0];
    if (nearest != null && nearest < 50) {
      banners.push(`Lightning reported ${Math.round(nearest)} miles away`);
    }
  }
  if (getPref("pref_notifyAqi", true) && environment?.aqi >= 100) {
    banners.push(`Air quality is elevated (AQI ${Math.round(environment.aqi)})`);
  }
  if (getPref("pref_notifyPollen", true) && environment?.pollen >= 20) {
    banners.push("Pollen is high in your area");
  }
  if (getPref("pref_notifyHurricane", true)) {
    const active = storms?.activeStorms || storms?.currentStorms || [];
    if (active.length) {
      banners.push(`${active.length} tropical cyclone${active.length === 1 ? "" : "s"} being tracked`);
    }
  }

  if (!banners.length) return null;

  return (
    <div className="space-y-2">
      {banners.map((text) => (
        <div key={text} className="rounded-2xl border border-sky-400/20 bg-sky-950/40 px-4 py-2 text-xs text-sky-100">
          {text}
        </div>
      ))}
    </div>
  );
}
