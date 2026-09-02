
import { Compass, MapPin, Ruler } from "lucide-react";

function InspectorRow({ icon: Icon, label, value, accent = "text-cyan-300" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/78 px-3 py-2.5 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        <Icon className={`h-3.5 w-3.5 ${accent}`} aria-hidden="true" />
        {label}
      </div>
      <div className="mt-1 text-sm font-bold text-white">{value}</div>
    </div>
  );
}

export default function RadarInspectorPanel({ inspector, productLabel }) {
  if (!inspector?.active) return null;
  return (
    <div className="grid grid-cols-2 gap-2" aria-label={`Inspector: ${productLabel}`}>
      <InspectorRow icon={MapPin} label="Latitude"  value={`${inspector.lat}°`}          accent="text-sky-400" />
      <InspectorRow icon={MapPin} label="Longitude" value={`${inspector.lon}°`}          accent="text-sky-400" />
      <InspectorRow icon={Compass} label="Bearing"  value={`${inspector.bearing}°`}      accent="text-amber-300" />
      <InspectorRow icon={Ruler}   label="Range"    value={`${inspector.range} mi`}      accent="text-emerald-300" />
    </div>
  );
}
