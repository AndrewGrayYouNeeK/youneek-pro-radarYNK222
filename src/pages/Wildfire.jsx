import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import PageScaffold from "@/components/more/PageScaffold";
import { fetchWildfires, fetchWildfiresDirect } from "@/lib/api/wildfires";
import { haversineMiles } from "@/lib/globe/math";
import { formatDistance } from "@/lib/units";
import { useUnits } from "@/lib/UnitsContext";
import useWeatherLocation from "@/hooks/useWeatherLocation";

export default function Wildfire() {
  const { coords } = useWeatherLocation();
  const { units } = useUnits();
  const { data } = useQuery({
    queryKey: ["wildfires"],
    staleTime: 300000,
    queryFn: async () => {
      try {
        const payload = await fetchWildfires();
        return payload.fires || [];
      } catch {
        return fetchWildfiresDirect();
      }
    },
  });

  const fires = (data || []).map((fire) => ({
    ...fire,
    miles:
      coords && Number.isFinite(fire.lat)
        ? haversineMiles(coords.latitude, coords.longitude, fire.lat, fire.lon)
        : null,
  }));

  return (
    <PageScaffold title="Wildfires">
      <p className="text-xs text-slate-400">
        Open wildfire events from NASA EONET. Toggle Wildfires on the 3D globe to see them plotted.
      </p>
      <Link to="/Globe" className="inline-flex rounded-xl bg-orange-500/20 px-3 py-2 text-xs font-medium text-orange-100">
        Show on 3D globe
      </Link>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        {fires.map((fire, index) => (
          <article key={fire.id} className={`px-4 py-3 ${index ? "border-t border-white/5" : ""}`}>
            <div className="text-sm font-medium text-white">{fire.title}</div>
            <div className="mt-1 text-[11px] text-slate-400">
              {fire.date ? new Date(fire.date).toLocaleString() : ""}
              {fire.miles != null ? ` · ${formatDistance(fire.miles, units)} away` : ""}
            </div>
          </article>
        ))}
        {!fires.length && <p className="px-4 py-6 text-sm text-slate-400">No open wildfire events in the feed.</p>}
      </div>
    </PageScaffold>
  );
}
