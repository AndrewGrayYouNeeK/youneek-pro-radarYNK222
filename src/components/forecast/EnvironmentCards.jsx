import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchEnvironment } from "@/lib/api/environment";
import { aqiCategory, pollenCategory, uvCategory } from "@/lib/weather/lifestyle";

function Box({ label, value, to, sub }) {
  const inner = (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-white">{value ?? "—"}</div>
      {sub && <div className="mt-0.5 text-[11px] text-slate-400">{sub}</div>}
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

export default function EnvironmentCards({ coords }) {
  const { data } = useQuery({
    queryKey: ["environment", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords),
    staleTime: 300000,
    queryFn: () => fetchEnvironment(coords),
  });
  const aqi = aqiCategory(data?.aqi);
  const pollen = pollenCategory(data?.pollen);
  const uv = uvCategory(data?.uv);

  return (
    <section>
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Air, UV & Pollen
      </h2>
      <div className="grid grid-cols-2 gap-2">
        <Box
          label="US AQI"
          value={data?.aqi != null ? Math.round(data.aqi) : null}
          sub={aqi.label}
          to="/AirQuality"
        />
        <Box
          label="PM2.5"
          value={data?.pm25 != null ? `${Math.round(data.pm25)} µg/m³` : null}
          to="/AirQuality"
        />
        <Box
          label="UV index"
          value={data?.uv != null ? Math.round(data.uv) : null}
          sub={uv.label}
          to="/Health"
        />
        <Box
          label="Pollen"
          value={data?.pollen != null ? Math.round(data.pollen) : "n/a"}
          sub={pollen.label}
          to="/Pollen"
        />
      </div>
    </section>
  );
}
