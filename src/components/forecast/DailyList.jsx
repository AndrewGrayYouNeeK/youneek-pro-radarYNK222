import { describeWeatherCode, formatDayLabel } from "@/lib/weather/conditions";
import { filterUpcomingDays } from "@/lib/weather/days";
import { formatTemp } from "@/lib/weather/units";
import { useUnits } from "@/lib/UnitsContext";

export default function DailyList({ days = [] }) {
  const { units } = useUnits();
  const upcoming = filterUpcomingDays(days);
  if (!upcoming.length) return null;

  return (
    <section>
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {upcoming.length}-Day Outlook
      </h2>
      <div className="min-h-40 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        {upcoming.map((day, index) => {
          const code = describeWeatherCode(day.weather_code);
          const Icon = code.icon;
          return (
            <div
              key={day.date}
              className={`flex items-center gap-3 px-4 py-3 ${index > 0 ? "border-t border-white/5" : ""}`}
            >
              <div className="w-24 shrink-0 text-sm font-medium text-white">{formatDayLabel(day.date)}</div>
              <Icon className="h-5 w-5 shrink-0 text-sky-300" aria-hidden="true" />
              <div className="min-w-0 flex-1 truncate text-xs text-slate-400">{day.label}</div>
              <div className="shrink-0 text-[11px] text-slate-500">{day.pop}%</div>
              <div className="flex shrink-0 items-center gap-2 text-sm tabular-nums">
                <span className="font-semibold text-white">{formatTemp(day.high, units.temp)}</span>
                <span className="text-slate-500">{formatTemp(day.low, units.temp)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
