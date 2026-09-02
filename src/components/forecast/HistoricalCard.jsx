import { formatPrecip, formatTemp } from "@/lib/weather/units";
import { useUnits } from "@/lib/UnitsContext";

export default function HistoricalCard({ extras, todayHigh, todayLow }) {
  const { units } = useUnits();
  const yesterday = extras?.yesterday;
  if (!yesterday) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Yesterday vs today
      </h2>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Yesterday</div>
          <div className="mt-1 text-white">
            {formatTemp(yesterday.high, units.temp)} / {formatTemp(yesterday.low, units.temp)}
          </div>
          <div className="text-xs text-slate-400">{formatPrecip(yesterday.precip, units.precip)} precip</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Today</div>
          <div className="mt-1 text-white">
            {formatTemp(todayHigh, units.temp)} / {formatTemp(todayLow, units.temp)}
          </div>
          <div className="text-xs text-slate-400">Historical comparison included</div>
        </div>
      </div>
    </section>
  );
}
