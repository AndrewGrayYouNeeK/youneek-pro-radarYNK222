import ForecastLayout from "@/components/home/ForecastLayout";
import WeatherSkeleton from "@/components/home/WeatherSkeleton";
import HourlyStrip from "@/components/forecast/HourlyStrip";
import TempChart from "@/components/home/TempChart";
import useUnifiedWeather from "@/hooks/useUnifiedWeather";
import useTabPageMemory from "@/hooks/useTabPageMemory";
import { formatHourTime } from "@/lib/weather/conditions";
import { formatTemp } from "@/lib/weather/units";
import { useUnits } from "@/lib/UnitsContext";

export default function Hourly() {
  useTabPageMemory("Hourly");
  const { units } = useUnits();
  const { data, isLoading } = useUnifiedWeather();
  const hours = data?.hourly || [];

  return (
    <ForecastLayout title="Hourly">
      <h2 className="text-lg font-semibold text-white">Next {Math.min(hours.length, 48)} hours</h2>
      {isLoading && !hours.length ? (
        <WeatherSkeleton />
      ) : (
        <>
      <div className="min-h-36 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
        <TempChart points={hours.slice(0, 24).map((hour) => ({ value: hour.temperature }))} />
        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>{hours[0] ? formatHourTime(hours[0].time) : "Now"}</span>
          <span>{hours[23] ? formatHourTime(hours[23].time) : ""}</span>
        </div>
      </div>
      <HourlyStrip hours={hours.slice(0, 48)} title="Hour by hour" />
      <div className="min-h-40 overflow-hidden rounded-2xl border border-white/10">
        {hours.slice(0, 24).map((hour) => (
          <div key={hour.time} className="flex items-center justify-between border-t border-white/5 px-4 py-3 text-sm first:border-t-0">
            <span className="text-slate-300">{formatHourTime(hour.time)}</span>
            <span className="text-slate-400">{hour.pop}% rain</span>
            <span className="font-semibold text-white">{formatTemp(hour.temperature, units.temp)}</span>
          </div>
        ))}
      </div>
        </>
      )}
    </ForecastLayout>
  );
}
