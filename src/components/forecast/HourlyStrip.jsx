import { describeWeatherCode, formatHourTime } from "@/lib/weather/conditions";

export default function HourlyStrip({ hours = [] }) {
  if (!hours.length) return null;

  return (
    <section>
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Next 48 Hours
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {hours.map((hour) => {
          const code = describeWeatherCode(hour.weather_code);
          const Icon = code.icon;
          return (
            <div
              key={hour.time}
              className="min-w-[4.75rem] rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center"
            >
              <div className="text-[11px] text-slate-400">{formatHourTime(hour.time)}</div>
              <Icon className="mx-auto my-2 h-5 w-5 text-sky-300" aria-hidden="true" />
              <div className="text-sm font-semibold text-white">{hour.temperature}°</div>
              <div className="mt-1 text-[10px] text-slate-500">{hour.pop}%</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
