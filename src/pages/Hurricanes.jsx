import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import PageScaffold from "@/components/more/PageScaffold";

export default function Hurricanes() {
  const { data } = useQuery({
    queryKey: ["activeStorms"],
    staleTime: 120000,
    queryFn: async () => {
      const response = await fetch("/api/getActiveStorms");
      if (!response.ok) throw new Error("Storms unavailable");
      return response.json();
    },
  });
  const storms = data?.activeStorms || data?.currentStorms || [];

  return (
    <PageScaffold title="Hurricane tracker">
      <p className="text-xs text-slate-400">
        Live tropical cyclones from the National Hurricane Center. Open the globe or 2D radar to see them on the map.
      </p>
      <div className="flex gap-2">
        <Link to="/Globe" className="rounded-xl bg-sky-500/20 px-3 py-2 text-xs font-medium text-sky-100">
          View on 3D globe
        </Link>
        <Link to="/Radar" className="rounded-xl bg-white/10 px-3 py-2 text-xs font-medium text-white">
          View on radar
        </Link>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        {storms.map((storm, index) => (
          <article key={storm.id || storm.name || index} className={`px-4 py-3 ${index ? "border-t border-white/5" : ""}`}>
            <div className="text-sm font-semibold text-white">
              {storm.binNumber || storm.name || "Unnamed system"}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              {[storm.classification, storm.intensity, storm.latitude && `${storm.latitude}, ${storm.longitude}`]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </article>
        ))}
        {!storms.length && (
          <p className="px-4 py-6 text-sm text-slate-400">No active tropical cyclones in the NHC feed right now.</p>
        )}
      </div>
    </PageScaffold>
  );
}
