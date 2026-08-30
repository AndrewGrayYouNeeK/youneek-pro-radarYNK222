import { useQuery } from "@tanstack/react-query";
import PageScaffold, { StatGrid } from "@/components/more/PageScaffold";
import LocationSearch from "@/components/location/LocationSearch";
import useWeatherLocation from "@/hooks/useWeatherLocation";
import { fetchEnvironment } from "@/lib/api/environment";
import { pollenCategory } from "@/lib/weather/lifestyle";

const LABELS = {
  alder: "Alder",
  birch: "Birch",
  grass: "Grass",
  mugwort: "Mugwort",
  olive: "Olive",
  ragweed: "Ragweed",
};

export default function Pollen() {
  const { coords, setLocation } = useWeatherLocation();
  const { data } = useQuery({
    queryKey: ["environment", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords),
    staleTime: 300000,
    queryFn: () => fetchEnvironment(coords),
  });
  const category = pollenCategory(data?.pollen);

  return (
    <PageScaffold title="Pollen & allergy">
      <LocationSearch current={coords} onSelect={setLocation} />
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Pollen index</div>
        <div className="mt-2 flex items-end gap-3">
          <div className="text-5xl font-extralight text-white">
            {data?.pollen != null ? Math.round(data.pollen) : "n/a"}
          </div>
          <div className="mb-1 text-sm text-amber-200">{category.label}</div>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Predominant:{" "}
          {data?.dominantPollen?.length
            ? data.dominantPollen.map((item) => LABELS[item.name] || item.name).join(", ")
            : "No species reported for this location"}
        </p>
      </div>
      <StatGrid
        items={Object.entries(LABELS).map(([key, label]) => ({
          label,
          value: data?.pollenTypes?.[key] != null ? Math.round(data.pollenTypes[key]) : "—",
        }))}
      />
    </PageScaffold>
  );
}
