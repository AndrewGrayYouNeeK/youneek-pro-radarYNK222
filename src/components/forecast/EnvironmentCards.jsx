import { useQuery } from "@tanstack/react-query";
import { fetchEnvironment } from "@/lib/api/environment";

function Box({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-white">{value ?? "—"}</div>
    </div>
  );
}

export default function EnvironmentCards({ coords }) {
  const { data } = useQuery({
    queryKey: ["environment", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords),
    staleTime: 300000,
    queryFn: () => fetchEnvironment(coords),
  });

  return (
    <section>
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Air, UV & Pollen
      </h2>
      <div className="grid grid-cols-2 gap-2">
        <Box label="US AQI" value={data?.aqi != null ? Math.round(data.aqi) : null} />
        <Box label="PM2.5" value={data?.pm25 != null ? `${Math.round(data.pm25)} µg/m³` : null} />
        <Box label="UV index" value={data?.uv != null ? Math.round(data.uv) : null} />
        <Box label="Pollen" value={data?.pollen != null ? Math.round(data.pollen) : "n/a"} />
      </div>
    </section>
  );
}
