import ForecastLayout from "@/components/home/ForecastLayout";
import DailyList from "@/components/forecast/DailyList";
import TempChart from "@/components/home/TempChart";
import useUnifiedWeather from "@/hooks/useUnifiedWeather";
import useTabPageMemory from "@/hooks/useTabPageMemory";

export default function Daily() {
  useTabPageMemory("Daily");
  const { data, isLoading } = useUnifiedWeather();
  const days = (data?.daily || []).slice(0, 10);

  return (
    <ForecastLayout title="10-Day">
      <h2 className="text-lg font-semibold text-white">10-day forecast</h2>
      {isLoading && !days.length && <p className="text-sm text-slate-400">Loading the daily forecast…</p>}
      <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
        <TempChart points={days.map((day) => ({ value: day.high }))} color="#fbbf24" />
        <p className="text-xs text-slate-400">Daily high temperatures</p>
      </div>
      <DailyList days={days} />
    </ForecastLayout>
  );
}
