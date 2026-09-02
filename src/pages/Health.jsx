import { useQuery } from "@tanstack/react-query";
import PageScaffold, { StatGrid } from "@/components/more/PageScaffold";
import LocationPicker from "@/components/forecast/LocationPicker";
import useWeatherLocation from "@/hooks/useWeatherLocation";
import { fetchEnvironment } from "@/lib/api/environment";
import { fetchOpenMeteo } from "@/lib/api/openMeteo";
import { adaptOpenMeteoCurrent } from "@/lib/weather/openmeteo-adapters";
import { coldFluRisk, outdoorScores, scoreLabel, uvCategory } from "@/lib/weather/lifestyle";

export default function Health() {
  const { coords } = useWeatherLocation();
  const { data } = useQuery({
    queryKey: ["health", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords),
    staleTime: 300000,
    queryFn: async () => {
      const [forecast, environment] = await Promise.all([
        fetchOpenMeteo(coords.latitude, coords.longitude),
        fetchEnvironment(coords),
      ]);
      return { current: adaptOpenMeteoCurrent(forecast).current, environment };
    },
  });

  const sports = outdoorScores(data?.current, data?.environment);
  const flu = coldFluRisk(data?.current, data?.environment);
  const uv = uvCategory(data?.current?.uv_index ?? data?.environment?.uv);

  return (
    <PageScaffold title="Health & sports">
      <LocationPicker />
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">UV index</div>
        <div className="mt-2 text-4xl font-extralight text-white">
          {Math.round(data?.current?.uv_index ?? data?.environment?.uv ?? 0)}
        </div>
        <p className="mt-2 text-sm text-amber-100">{uv.label}</p>
        <p className="mt-1 text-xs text-slate-400">{uv.advice}</p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Cold & flu risk</div>
        <div className="mt-2 text-4xl font-extralight text-white">{flu.score}</div>
        <p className="mt-1 text-sm text-sky-100">{flu.label}</p>
        <p className="mt-1 text-xs text-slate-400">
          Built from temperature, humidity, wind, and air quality — not a medical diagnosis.
        </p>
      </div>
      <StatGrid
        items={sports.map((item) => ({
          label: item.label,
          value: item.score,
          sub: scoreLabel(item.score),
        }))}
      />
    </PageScaffold>
  );
}
