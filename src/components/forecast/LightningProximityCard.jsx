import { useQuery } from "@tanstack/react-query";
import { fetchLightning } from "@/lib/api/outlook";
import { describeApproach, nearestPoint } from "@/lib/geo";
import { getPref } from "@/lib/prefs";

export default function LightningProximityCard({ coords }) {
  const { data } = useQuery({
    queryKey: ["lightning-proximity", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords) && getPref("pref_notifyLightning", true),
    refetchInterval: 60000,
    queryFn: fetchLightning,
  });

  if (!getPref("pref_notifyLightning", true)) return null;

  const origin = coords ? { lat: coords.latitude, lon: coords.longitude } : null;
  const nearest = origin
    ? nearestPoint(origin, data?.strikes || [], (strike) => strike)
    : null;
  const approach = nearest && nearest.miles <= 50 ? describeApproach(origin, nearest.item) : null;

  if (!approach) {
    return (
      <section className="min-h-24 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Storm distance
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          {data ? "No lightning or storm reports within 50 miles." : "Checking nearby lightning and storms…"}
        </p>
      </section>
    );
  }

  const hot = approach.miles <= 10;
  const kind = nearest.item.kind === "lightning" ? "Lightning" : "Storm";
  const eta =
    approach.etaMinutes < 60 ? `${approach.etaMinutes} min` : `${(approach.etaMinutes / 60).toFixed(1)} hr`;
  return (
    <section className={`min-h-24 rounded-2xl border px-4 py-3 ${hot ? "border-yellow-400/40 bg-yellow-950/40" : "border-amber-400/20 bg-amber-950/20"}`}>
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-yellow-100/70">
        Storm distance
      </h2>
      <p className="mt-2 text-lg font-semibold text-yellow-50">
        {kind} {approach.miles.toFixed(1)} mi {approach.cardinal}
      </p>
      <p className="mt-1 text-xs text-yellow-100/70">
        Bearing {Math.round(approach.bearing)}° · estimated arrival {eta}
      </p>
      <p className="mt-1 text-xs text-yellow-100/60">
        {nearest.item.source || "Storm report"} · {nearest.item.ageMinutes ?? "?"} min ago
      </p>
    </section>
  );
}
