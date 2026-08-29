import { Clock3, Eye, Layers3, ShieldAlert } from "lucide-react";

function StatusCell({ icon: Icon, label, value, tone = "text-cyan-300" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/82 px-3 py-2 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        <Icon className={`h-3.5 w-3.5 ${tone}`} aria-hidden="true" />
        {label}
      </div>
      <div className="mt-1 text-sm font-bold text-white">{value}</div>
    </div>
  );
}

export default function RadarStatusBar({ productLabel, isLooping, frameLabel, warnings }) {
  return (
    <div className="pointer-events-none absolute left-3 right-3 top-3 z-[1000] hidden md:block">
      <div className="grid grid-cols-2 gap-2 rounded-3xl border border-white/10 bg-slate-950/78 p-2 shadow-2xl backdrop-blur-xl md:grid-cols-4">
        <StatusCell icon={Layers3} label="Product" value={productLabel} tone="text-cyan-300" />
        <StatusCell icon={Clock3} label="Frame" value={frameLabel || "Live"} tone="text-emerald-300" />
        <StatusCell icon={Eye} label="Playback" value={isLooping ? "Looping" : "Realtime"} tone="text-amber-300" />
        <StatusCell icon={ShieldAlert} label="Warnings" value={`${warnings} active`} tone="text-red-300" />
      </div>
    </div>
  );
}