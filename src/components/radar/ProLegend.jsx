
import { Layers } from "lucide-react";

const REFLECTIVITY_SCALE = [
  { label: "65+ dBZ", color: "#d946ef", bg: "bg-fuchsia-500" },
  { label: "55 dBZ",  color: "#ef4444", bg: "bg-red-500" },
  { label: "45 dBZ",  color: "#f97316", bg: "bg-orange-400" },
  { label: "35 dBZ",  color: "#eab308", bg: "bg-yellow-400" },
  { label: "20 dBZ",  color: "#84cc16", bg: "bg-lime-400" },
  { label: "5 dBZ",   color: "#38bdf8", bg: "bg-sky-400" },
];

export default function ProLegend({ productLabel }) {
  const isReflectivity = !productLabel || productLabel === "Reflectivity";
  return (
    <div
      className="pointer-events-none absolute z-[1000] flex flex-col gap-0.5"
      style={{ top: "5.5rem", left: "0.75rem" }}
      aria-label="Radar color legend"
    >
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        <Layers className="h-3 w-3 text-slate-400" aria-hidden="true" />
        {productLabel || "Reflectivity"}
      </div>
      {isReflectivity && REFLECTIVITY_SCALE.map(({ label, bg }) => (
        <div key={label} className="flex items-center gap-2">
          <div className={`h-2.5 w-5 rounded-sm ${bg} opacity-90 shadow`} />
          <span className="text-[10px] font-medium text-slate-300">{label}</span>
        </div>
      ))}
    </div>
  );
}
