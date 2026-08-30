import { useQuery } from "@tanstack/react-query";
import PageScaffold, { StatGrid } from "@/components/more/PageScaffold";
import LocationSearch from "@/components/location/LocationSearch";
import useWeatherLocation from "@/hooks/useWeatherLocation";
import { fetchOpenMeteo } from "@/lib/api/openMeteo";
import { adaptOpenMeteoCurrent } from "@/lib/weather/openmeteo-adapters";
import { getMoonPhase } from "@/lib/weather/moon";

export default function Astronomy() {
  const { coords, setLocation } = useWeatherLocation();
  const moon = getMoonPhase();
  const { data } = useQuery({
    queryKey: ["astronomy", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords),
    staleTime: 300000,
    queryFn: () => fetchOpenMeteo(coords.latitude, coords.longitude),
  });
  const adapted = data ? adaptOpenMeteoCurrent(data) : null;
  const sunrise = adapted?.daily?.sunrise?.[0];
  const sunset = adapted?.daily?.sunset?.[0];

  return (
    <PageScaffold title="Sun & moon">
      <LocationSearch current={coords} onSelect={setLocation} />
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-center">
        <div className="text-5xl">{moon.emoji}</div>
        <div className="mt-2 text-xl font-semibold text-white">{moon.name}</div>
        <p className="mt-1 text-xs text-slate-400">{moon.illumination}% illuminated · {moon.age} days old</p>
      </div>
      <StatGrid
        items={[
          {
            label: "Sunrise",
            value: sunrise
              ? new Date(sunrise).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
              : "—",
          },
          {
            label: "Sunset",
            value: sunset
              ? new Date(sunset).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
              : "—",
          },
        ]}
      />
    </PageScaffold>
  );
}
