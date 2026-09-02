import { formatPrecip } from "@/lib/weather/units";
import { useUnits } from "@/lib/UnitsContext";
import { getPref } from "@/lib/prefs";

export default function PrecipOutlookCard({ extras }) {
  const { units } = useUnits();
  if (!extras || !getPref("pref_notifyPrecip24", true)) return null;
  const chance = Math.round(extras.precipChance24h || 0);
  const amount = extras.precip24hIn || 0;

  return (
    <section className="rounded-2xl border border-cyan-400/20 bg-cyan-950/20 px-4 py-3">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/70">
        Next 24 hours
      </h2>
      <p className="mt-2 text-sm text-white">
        {chance >= 20
          ? `${chance}% chance of rain or snow · ${formatPrecip(amount, units.precip)} forecast`
          : `Dry stretch likely · ${formatPrecip(amount, units.precip)} expected`}
      </p>
    </section>
  );
}
