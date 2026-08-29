import { Wind } from "lucide-react";

const CARDINAL_DIRS = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
function degreesToCardinal(deg) {
  if (deg === null || deg === undefined || isNaN(deg)) return "";
  return CARDINAL_DIRS[Math.round(((deg % 360) + 360) % 360 / 22.5) % 16];
}

export default function WindSpeedDisplay({ windData }) {
  if (!windData) return null;

  const { speedMph, directionDeg, gustMph, stationName } = windData;
  const cardinal = degreesToCardinal(directionDeg);
  const speedLabel = speedMph !== null && speedMph !== undefined ? `${Math.round(speedMph)}` : "--";
  const gustLabel = gustMph !== null && gustMph !== undefined && gustMph > speedMph ? ` (G${Math.round(gustMph)})` : "";

  return (
    <div
      className="pointer-events-none absolute z-[1000]"
      style={{ top: "0.75rem", left: "0.75rem" }}
    >
      <div className="pointer-events-auto rounded-2xl border border-cyan-400/15 bg-slate-950/82 px-3.5 py-2.5 shadow-[0_10px_30px_rgba(2,6,23,0.45)] backdrop-blur-md">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200/65">
          <Wind className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
          Wind
        </div>
        <div className="mt-1 text-sm font-bold text-white sm:text-[15px]">
          {speedLabel} mph {cardinal}{gustLabel}
        </div>
        {stationName && (
          <div className="mt-0.5 text-[9px] text-slate-500 truncate max-w-[140px]">
            {stationName}
          </div>
        )}
      </div>
    </div>
  );
}
