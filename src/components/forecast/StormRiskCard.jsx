import { useQuery } from "@tanstack/react-query";
import { fetchStormOutlook } from "@/lib/api/outlook";

function riskTone(category) {
  const value = String(category || "").toLowerCase();
  if (value.includes("high")) return "border-red-400/40 bg-red-950/40 text-red-50";
  if (value.includes("enhanced") || value.includes("moderate")) return "border-orange-400/40 bg-orange-950/40 text-orange-50";
  if (value.includes("slight")) return "border-yellow-400/30 bg-yellow-950/30 text-yellow-50";
  if (value.includes("marginal")) return "border-lime-400/30 bg-lime-950/30 text-lime-50";
  return "border-white/10 bg-white/5 text-slate-100";
}

export default function StormRiskCard({ coords }) {
  const { data } = useQuery({
    queryKey: ["spc-outlook", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords),
    staleTime: 300000,
    queryFn: () => fetchStormOutlook(coords.latitude, coords.longitude),
  });

  const category = data?.category || "No categorical risk at this point";
  const snippet = String(data?.discussion || "")
    .split("\n")
    .filter((line) => line.trim() && !line.startsWith("."))
    .slice(0, 6)
    .join(" ");

  return (
    <section className={`rounded-2xl border px-4 py-3 ${riskTone(data?.category)}`}>
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-current/70">
        Severe storm risk
      </h2>
      <p className="mt-2 text-lg font-semibold">{category}</p>
      {snippet && <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-current/80">{snippet}</p>}
      <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-current/50">SPC Day 1 · included</p>
    </section>
  );
}
