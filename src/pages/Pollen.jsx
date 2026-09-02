import { useQuery } from "@tanstack/react-query";
import PageScaffold, { StatGrid } from "@/components/more/PageScaffold";
import LocationPicker from "@/components/forecast/LocationPicker";
import useWeatherLocation from "@/hooks/useWeatherLocation";
import { fetchEnvironment } from "@/lib/api/environment";
import { pollenCategory } from "@/lib/weather/aqi";

const LABELS = {
  alder: "Alder",
  birch: "Birch",
  grass: "Grass",
  mugwort: "Mugwort",
  olive: "Olive",
  ragweed: "Ragweed",
};

export default function Pollen() {
  const { coords } = useWeatherLocation();
  const { data } = useQuery({
    queryKey: ["environment", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords),
    staleTime: 300000,
    queryFn: () => fetchEnvironment(coords),
  });
  const category = pollenCategory(data?.pollen);
  const breakdown = data?.pollenBreakdown || {};
  const dominant = Object.entries(breakdown)
    .filter(([, value]) => Number.isFinite(Number(value)))
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 3)
    .map(([name]) => LABELS[name] || name);

  return (
    <PageScaffold title="Pollen & allergy">
      <LocationPicker />
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Pollen index</div>
        <div className="mt-2 flex items-end gap-3">
          <div className="text-5xl font-extralight text-white">
            {data?.pollen != null ? Math.round(data.pollen) : "n/a"}
          </div>
          <div className={`mb-1 text-sm ${category.tone}`}>{category.label}</div>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Predominant: {dominant.length ? dominant.join(", ") : "No species reported for this location"}
        </p>
      </div>
      <StatGrid
        items={Object.entries(LABELS).map(([key, label]) => ({
          label,
          value: breakdown[key] != null ? Math.round(breakdown[key]) : "—",
        }))}
      />
    </PageScaffold>
  );
}
