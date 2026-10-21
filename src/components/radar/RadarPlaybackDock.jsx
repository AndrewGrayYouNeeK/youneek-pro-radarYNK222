import { useState } from "react";
import {
  CalendarDays,
  Clock,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Flame,
  Globe,
  LayoutGrid,
  Pencil,
  Radar,
  Radio,
  Repeat,
  Satellite,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Users,
  X,
  Zap,
} from "lucide-react";
import { featuresOnMap } from "@/lib/mapDesk";

const ICONS = {
  radar: Radar,
  lightning: Zap,
  satellite: Satellite,
  hurricanes: CloudLightning,
  fires: Flame,
  loop: Repeat,
  alerts: ShieldAlert,
  tornado: ShieldAlert,
  severe: CloudLightning,
  flood: CloudRain,
  winter: CloudSnow,
  now: CloudSun,
  hourly: Clock,
  daily: CalendarDays,
  radio: Radio,
  globe: Globe,
  more: LayoutGrid,
  settings: Settings,
  contacts: Users,
  help: ShieldAlert,
  safe: ShieldCheck,
};

function tileTone(id, active) {
  if (id === "help") {
    return active
      ? "border-red-500 bg-red-600 text-white"
      : "border-red-500/50 bg-red-950/70 text-red-100";
  }
  if (id === "safe") {
    return active
      ? "border-emerald-400 bg-emerald-400 text-slate-950"
      : "border-emerald-400/40 bg-emerald-400/15 text-emerald-100";
  }
  return active
    ? "border-cyan-300/70 bg-cyan-300 text-slate-950"
    : "border-white/10 bg-white/5 text-slate-200";
}

function FeatureTile({ id, label, active, editing, onClick, onHide }) {
  const Icon = ICONS[id] || LayoutGrid;
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`flex h-[3.15rem] w-full min-h-[3.15rem] flex-col items-center justify-center gap-0.5 rounded-xl border px-0.5 ${tileTone(id, active)}`}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="w-full truncate text-center text-[9px] font-semibold leading-tight">{label}</span>
      </button>
      {editing && (
        <button
          type="button"
          onClick={onHide}
          aria-label={`Hide ${label} from radar`}
          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-white ring-1 ring-white/20"
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export default function RadarPlaybackDock({
  dockIds = [],
  layers = {},
  onChipClick,
  onOpenMore,
  onTogglePin,
  onResetDock,
  showSafetyActions = true,
}) {
  const [editing, setEditing] = useState(false);
  const groups = featuresOnMap(dockIds, { safetyActions: showSafetyActions });

  return (
    <div className="pointer-events-auto mx-auto w-full max-w-xl overflow-hidden rounded-[1.4rem] border border-white/10 bg-slate-950/95 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl">
      <div className="flex items-center gap-2 px-3 pt-2.5">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Pro desk</div>
          <div className="text-[11px] text-slate-400">
            {editing ? "Tap X to hide a tool. Reset brings everything back." : "Pin the tools you want on this radar."}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditing((value) => !value)}
          aria-pressed={editing}
          className={`flex h-9 min-h-9 items-center gap-1 rounded-full border px-3 text-[11px] font-semibold ${
            editing ? "border-cyan-300 bg-cyan-300 text-slate-950" : "border-white/10 bg-white/5 text-white"
          }`}
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          {editing ? "Done" : "Edit"}
        </button>
        <button
          type="button"
          onClick={onOpenMore}
          className="flex h-9 min-h-9 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 text-[11px] font-semibold text-white"
        >
          <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
          Layers
        </button>
      </div>

      <div className="max-h-[38vh] space-y-2 overflow-y-auto px-3 pb-3 pt-2">
        {groups.map((group) => (
          <div key={group.id}>
            <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">{group.label}</div>
            <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
              {group.features.map((feature) => (
                <FeatureTile
                  key={feature.id}
                  id={feature.id}
                  label={feature.label}
                  active={Boolean(layers[feature.id])}
                  editing={editing}
                  onClick={() => onChipClick(feature.id)}
                  onHide={() => onTogglePin(feature.id)}
                />
              ))}
            </div>
          </div>
        ))}
        {editing && (
          <button
            type="button"
            onClick={onResetDock}
            className="flex min-h-9 w-full items-center justify-center rounded-xl border border-white/10 text-[11px] font-semibold text-slate-300"
          >
            Show all tools
          </button>
        )}
      </div>
    </div>
  );
}
