import { useQuery } from "@tanstack/react-query";
import { fetchEnvironment } from "@/lib/api/environment";
import { aqiCategory, pollenCategory, uvCategory } from "@/lib/weather/aqi";

function Box({ label, value, detail, tone }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className={`mt-1 text-lg font-semibold ${tone || "text-white"}`}>{value ?? "—"}</div>
      {detail && <div className="mt-0.5 text-[11px] text-slate-400">{detail}</div>}
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

  const aqi = aqiCategory(data?.aqi);
  const uv = uvCategory(data?.uv);
  const pollen = pollenCategory(data?.pollen);
  const breakdown = Object.entries(data?.pollenBreakdown || {}).filter(([, value]) => Number.isFinite(Number(value)));

  return (
    <section>
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Air quality, UV & pollen
      </h2>
      <div className="grid grid-cols-2 gap-2">
        <Box label="US AQI" value={data?.aqi != null ? Math.round(data.aqi) : null} detail={aqi.label} tone={aqi.tone} />
        <Box label="PM2.5" value={data?.pm25 != null ? `${Math.round(data.pm25)} µg/m³` : null} />
        <Box label="UV index" value={data?.uv != null ? Math.round(data.uv) : null} detail={uv.label} tone={uv.tone} />
        <Box
          label="Pollen"
          value={data?.pollen != null ? Math.round(data.pollen) : "n/a"}
          detail={pollen.label}
          tone={pollen.tone}
        />
      </div>
      {breakdown.length > 0 && (
        <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
          {breakdown.map(([name, value]) => (
            <div key={name} className="flex justify-between rounded-xl border border-white/5 px-3 py-2 capitalize">
              <span>{name}</span>
              <span className="text-white">{Math.round(Number(value))}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
