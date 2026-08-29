
import { MapPin, Navigation, Radar, ShieldAlert } from "lucide-react";

function DockItem({ icon: Icon, label, value, accent = "text-cyan-300" }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/75 px-2 py-1.5 shadow-md backdrop-blur-md">
      <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        <Icon className={`h-3 w-3 ${accent}`} aria-hidden="true" />
        {label}
      </div>
      <div className="mt-0.5 text-xs font-bold text-white">{value}</div>
    </div>
  );
}

export default function RadarDataDock({ metrics, station }) {
  if (!metrics) return null;
  return (
    <div className="grid grid-cols-2 gap-1.5">
      <DockItem
        icon={MapPin}
        label="Lat/Lon"
        value={`${metrics.latitude}°${metrics.latHemisphere} ${metrics.longitude}°${metrics.lonHemisphere}`}
        accent="text-sky-400"
      />
      <DockItem
        icon={Radar}
        label="Station"
        value={station || "—"}
        accent="text-emerald-300"
      />
      <DockItem
        icon={Navigation}
        label="Zoom"
        value={`${metrics.zoom}×`}
        accent="text-amber-300"
      />
      <DockItem
        icon={ShieldAlert}
        label="Warnings"
        value={`${metrics.warnings} active`}
        accent={metrics.warnings > 0 ? "text-red-400" : "text-slate-400"}
      />
    </div>
  );
}
