import { useMemo, useState } from "react";
import { CloudRain, X } from "lucide-react";
import useUnifiedWeather from "@/hooks/useUnifiedWeather";
import { getPref } from "@/lib/prefs";
import { rainArrivalFromForecast } from "@/lib/weather/rainTiming";

function copyFor(arrival) {
  if (arrival?.status === "rain_now") {
    return {
      title: "Rain is starting now",
      detail: "Open-Meteo shows precipitation at your location.",
      tone: "border-cyan-400/40 bg-cyan-950/80 text-cyan-100",
    };
  }
  return {
    title: `Rain in ${arrival.minutesUntilRain} min`,
    detail: "From the Open-Meteo 15-minute forecast. WeatherKit fills in the exact minute when it arrives.",
    tone: "border-blue-400/40 bg-blue-950/80 text-blue-100",
  };
}

export default function RainArrivalAlert({ presentation = "overlay" }) {
  const enabled = getPref("pref_notifyRain", true);
  const { data } = useUnifiedWeather();
  const [dismissed, setDismissed] = useState(false);
  const arrival = useMemo(
    () =>
      rainArrivalFromForecast({
        openMeteoMinutes: data?.openMeteoMinutes || [],
        weatherKitMinutes: data?.weatherKitMinutes || [],
      }),
    [data]
  );

  if (!enabled || !data || dismissed || arrival.status === "dry") return null;

  const copy = copyFor(arrival);
  const card = (
    <div className={`w-full rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-md ${copy.tone}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-white/10 p-2">
          <CloudRain className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{copy.title}</p>
          <p className="mt-1 text-xs opacity-80">{copy.detail}</p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss rain alert"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );

  if (presentation === "inline") return card;
  return <div className="pointer-events-auto w-full max-w-sm">{card}</div>;
}
