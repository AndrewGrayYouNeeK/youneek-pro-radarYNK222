import { formatPrecip } from "@/lib/weather/units";
import { useUnits } from "@/lib/UnitsContext";

export default function WinterCard({ extras }) {
  const { units } = useUnits();
  if (!extras) return null;
  const snow = Number(extras.snowDepthIn || 0);
  const fall = Number(extras.snowfall24hIn || 0);
  if (snow < 0.05 && fall < 0.05) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Winter</h2>
        <p className="mt-2 text-sm text-slate-300">No measurable snow depth at this location.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-sky-400/20 bg-sky-950/30 px-4 py-3">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200/70">Winter weather</h2>
      <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-white">
        <div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-sky-200/60">Snow depth</div>
          <div className="mt-1 text-lg font-semibold">{formatPrecip(snow, units.precip)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-sky-200/60">Next 24h snow</div>
          <div className="mt-1 text-lg font-semibold">{formatPrecip(fall, units.precip)}</div>
        </div>
      </div>
    </section>
  );
}
