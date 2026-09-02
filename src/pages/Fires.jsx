import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import AppHeader from "@/components/mobile/AppHeader";
import BottomTab from "@/components/radar/BottomTab";
import useTabPageMemory from "@/hooks/useTabPageMemory";
import useWeatherLocation from "@/hooks/useWeatherLocation";
import { fetchFires } from "@/lib/api/outlook";
import { haversineMi } from "@/lib/geo";

export default function Fires() {
  useTabPageMemory("Forecast");
  const { coords } = useWeatherLocation();
  const { data, isLoading, error } = useQuery({
    queryKey: ["fire-center"],
    queryFn: fetchFires,
    staleTime: 5 * 60 * 1000,
  });

  const nearby = useMemo(() => {
    const detections = data?.detections || [];
    if (!coords) return detections.slice(0, 20);
    return detections
      .map((fire) => ({
        ...fire,
        miles: haversineMi(coords.latitude, coords.longitude, fire.lat, fire.lon),
      }))
      .sort((a, b) => a.miles - b.miles)
      .slice(0, 25);
  }, [data, coords]);

  return (
    <div className="flex h-[100dvh] flex-col bg-slate-950">
      <AppHeader title="Fire Center" />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-28">
        <div className="mx-auto max-w-md space-y-4">
          <p className="text-xs text-slate-500">
            NASA FIRMS VIIRS detections plus EONET wildfire events. The same layer plots on radar and the 3D globe.
          </p>
          {(data?.events || []).slice(0, 8).map((event) => (
            <article key={event.id} className="rounded-2xl border border-orange-400/20 bg-orange-950/20 px-4 py-3">
              <div className="text-sm font-semibold text-white">{event.title}</div>
              <div className="mt-1 text-xs text-orange-100/70">{event.date || "Active"}</div>
            </article>
          ))}
          {isLoading && <p className="text-sm text-slate-400">Loading fire detections…</p>}
          {error && <p className="text-sm text-red-300">{error.message}</p>}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            {nearby.map((fire, index) => (
              <div key={`${fire.lat}-${fire.lon}-${index}`} className="flex items-center justify-between border-t border-white/5 px-4 py-3 first:border-t-0">
                <div>
                  <div className="text-sm text-white">
                    {fire.lat.toFixed(2)}, {fire.lon.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    FRP {Number(fire.frp || 0).toFixed(1)} · {fire.confidence || "n/a"} confidence
                  </div>
                </div>
                <div className="text-xs text-orange-200">
                  {Number.isFinite(fire.miles) ? `${fire.miles.toFixed(0)} mi` : fire.date}
                </div>
              </div>
            ))}
          </div>
          <Link to="/Globe" className="inline-block text-xs font-semibold text-cyan-300">
            Plot fires on the 3D globe →
          </Link>
        </div>
      </div>
      <BottomTab />
    </div>
  );
}
