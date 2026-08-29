
import { Clock, Compass, Crosshair, Navigation, X } from "lucide-react";

const CARDINAL_DIRS = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
function bearingToCardinal(deg) {
  return CARDINAL_DIRS[Math.round(((deg % 360) + 360) % 360 / 22.5) % 16];
}

function ToolChip({ icon: IconComponent, label, value, accent = "text-cyan-300" }) {
  return (
    <div className="rounded-2xl border border-cyan-400/15 bg-slate-950/82 px-3.5 py-3 shadow-[0_10px_30px_rgba(2,6,23,0.45)] backdrop-blur-md">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200/65">
        <IconComponent className={`h-3.5 w-3.5 ${accent}`} aria-hidden="true" />
        {label}
      </div>
      <div className="mt-1.5 text-sm font-bold text-white sm:text-[15px]">{value}</div>
    </div>
  );
}

export default function StormToolsPanel({ stormData, onClose }) {
  if (!stormData) return null;
  const { bearing, distanceMi, speedMph, etaMinutes } = stormData;
  const cardinal = bearingToCardinal(bearing);
  const etaLabel = etaMinutes < 1
    ? "< 1 min"
    : etaMinutes < 60
      ? `${etaMinutes} min`
      : `${(etaMinutes / 60).toFixed(1)} hr`;

  return (
    <div className="pointer-events-auto w-full" role="dialog" aria-label="Storm tracking panel">
      <div className="rounded-3xl border border-cyan-400/20 bg-slate-950/88 p-3 shadow-2xl backdrop-blur-xl">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
            ⚡ Storm Tracking
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-slate-300 transition-colors hover:bg-white/20"
            aria-label="Close storm tracking panel"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ToolChip icon={Compass}   label="Direction"    value={`${Math.round(bearing)}° ${cardinal}`} accent="text-cyan-300" />
          <ToolChip icon={Crosshair} label="Distance"     value={`${distanceMi} mi`}                   accent="text-sky-400" />
          <ToolChip icon={Navigation} label="Est. Speed"  value={`~${speedMph} mph`}                   accent="text-amber-300" />
          <ToolChip icon={Clock}     label="Est. Arrival" value={etaLabel}                              accent="text-red-400" />
        </div>
        <p className="mt-2 text-center text-[10px] text-slate-500">
          Estimates based on typical storm motion. Tap map to track another cell.
        </p>
      </div>
    </div>
  );
}
