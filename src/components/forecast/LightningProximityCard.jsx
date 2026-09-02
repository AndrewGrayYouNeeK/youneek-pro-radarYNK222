import { useQuery } from "@tanstack/react-query";
import { fetchLightning } from "@/lib/api/outlook";
import { nearestPoint } from "@/lib/geo";
import { getPref } from "@/lib/prefs";

export default function LightningProximityCard({ coords }) {
  const { data } = useQuery({
    queryKey: ["lightning-proximity", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords) && getPref("pref_notifyLightning", true),
    refetchInterval: 60000,
    queryFn: fetchLightning,
  });

  if (!getPref("pref_notifyLightning", true)) return null;

  const nearest = coords
    ? nearestPoint(
        { lat: coords.latitude, lon: coords.longitude },
        (data?.strikes || []).filter((strike) => strike.kind === "lightning"),
        (strike) => strike
      )
    : null;

  if (!nearest || nearest.miles > 50) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Lightning proximity
        </h2>
        <p className="mt-2 text-sm text-slate-300">No lightning reports within 50 miles.</p>
      </section>
    );
  }

  const hot = nearest.miles <= 10;
  return (
    <section className={`rounded-2xl border px-4 py-3 ${hot ? "border-yellow-400/40 bg-yellow-950/40" : "border-amber-400/20 bg-amber-950/20"}`}>
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-yellow-100/70">
        Lightning proximity
      </h2>
      <p className="mt-2 text-lg font-semibold text-yellow-50">
        Strike report {nearest.miles.toFixed(1)} miles away
      </p>
      <p className="mt-1 text-xs text-yellow-100/70">
        {nearest.item.source || "Storm report"} · {nearest.item.ageMinutes ?? "?"} min ago
      </p>
    </section>
  );
}
