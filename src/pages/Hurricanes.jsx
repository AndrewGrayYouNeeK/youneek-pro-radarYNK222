import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import AppHeader from "@/components/mobile/AppHeader";
import BottomTab from "@/components/radar/BottomTab";
import useTabPageMemory from "@/hooks/useTabPageMemory";
import { fetchActiveStorms } from "@/lib/api/outlook";

export default function Hurricanes() {
  useTabPageMemory("Forecast");
  const { data, isLoading, error } = useQuery({
    queryKey: ["hurricane-center"],
    queryFn: fetchActiveStorms,
    refetchInterval: 5 * 60 * 1000,
  });

  const storms = data?.activeStorms || data?.currentStorms || [];

  return (
    <div className="flex h-[100dvh] flex-col bg-slate-950">
      <AppHeader title="Hurricane Center" />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-28">
        <div className="mx-auto max-w-md space-y-4">
          <p className="text-xs text-slate-500">
            Live National Hurricane Center positions, motion, and intensity. Included — no premium gate.
          </p>
          {isLoading && <p className="text-sm text-slate-400">Loading active cyclones…</p>}
          {error && <p className="text-sm text-red-300">{error.message}</p>}
          {!isLoading && storms.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-300">
              No active tropical cyclones in the NHC basin right now.
            </div>
          )}
          {storms.map((storm) => (
            <article key={storm.id || storm.binNumber || storm.name} className="rounded-2xl border border-rose-400/20 bg-rose-950/20 px-4 py-4">
              <div className="text-lg font-semibold text-white">{storm.name || "Unnamed cyclone"}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.14em] text-rose-200/70">
                {storm.classification || storm.binNumber || "Tropical system"}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-200">
                <div>Lat {Number(storm.latitude ?? storm.lat).toFixed(1)}</div>
                <div>Lon {Number(storm.longitude ?? storm.lon).toFixed(1)}</div>
                <div>Winds {storm.intensity || storm.maxWind || "—"}</div>
                <div>Pressure {storm.pressure || "—"}</div>
                <div>Motion {storm.movementDir || "—"}</div>
                <div>Speed {storm.movementSpeed || "—"}</div>
              </div>
              <Link to="/Globe" className="mt-3 inline-block text-xs font-semibold text-cyan-300">
                View on 3D globe →
              </Link>
            </article>
          ))}
        </div>
      </div>
      <BottomTab />
    </div>
  );
}
