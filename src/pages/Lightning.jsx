import { useQuery } from "@tanstack/react-query";
import PageScaffold from "@/components/more/PageScaffold";
import LocationPicker from "@/components/forecast/LocationPicker";
import useWeatherLocation from "@/hooks/useWeatherLocation";
import { haversineMiles } from "@/lib/globe/math";
import { formatDistance } from "@/lib/units";
import { useUnits } from "@/lib/UnitsContext";

export default function Lightning() {
  const { coords } = useWeatherLocation();
  const { units } = useUnits();
  const { data } = useQuery({
    queryKey: ["lightning"],
    staleTime: 60000,
    queryFn: async () => {
      const response = await fetch("/api/lightning");
      if (!response.ok) throw new Error("Lightning unavailable");
      return response.json();
    },
  });

  const strikes = data?.strikes || [];
  const nearest = coords
    ? strikes
        .map((strike) => ({
          ...strike,
          miles: haversineMiles(coords.latitude, coords.longitude, strike.lat, strike.lon),
        }))
        .sort((a, b) => a.miles - b.miles)[0]
    : null;

  return (
    <PageScaffold title="Lightning">
      <LocationPicker />
      <div className="rounded-3xl border border-amber-400/20 bg-amber-950/20 p-5">
        <div className="text-[11px] uppercase tracking-[0.16em] text-amber-200/70">Closest report</div>
        <div className="mt-2 text-3xl font-light text-white">
          {nearest ? formatDistance(nearest.miles, units) : "No nearby strikes"}
        </div>
        <p className="mt-2 text-xs text-slate-400">
          {nearest
            ? `${nearest.source} · ${nearest.ageMinutes ?? "?"} min ago`
            : "Lightning and storm reports from the last 6 hours."}
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        {strikes.slice(0, 20).map((strike, index) => (
          <div
            key={`${strike.lat}-${strike.lon}-${index}`}
            className={`flex items-center justify-between px-4 py-3 text-sm ${index ? "border-t border-white/5" : ""}`}
          >
            <div>
              <div className="text-white">{strike.source}</div>
              <div className="text-[11px] text-slate-500">
                {strike.lat.toFixed(2)}, {strike.lon.toFixed(2)}
              </div>
            </div>
            <div className="text-xs text-amber-200">{strike.ageMinutes ?? "—"} min</div>
          </div>
        ))}
        {!strikes.length && <p className="px-4 py-6 text-sm text-slate-500">No lightning reports right now.</p>}
      </div>
    </PageScaffold>
  );
}
