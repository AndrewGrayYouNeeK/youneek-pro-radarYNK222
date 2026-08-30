import { useQuery } from "@tanstack/react-query";
import PageScaffold, { StatGrid } from "@/components/more/PageScaffold";
import LocationSearch from "@/components/location/LocationSearch";
import useWeatherLocation from "@/hooks/useWeatherLocation";
import { fetchEnvironment } from "@/lib/api/environment";
import { aqiCategory } from "@/lib/weather/lifestyle";

export default function AirQuality() {
  const { coords, setLocation } = useWeatherLocation();
  const { data } = useQuery({
    queryKey: ["environment", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords),
    staleTime: 300000,
    queryFn: () => fetchEnvironment(coords),
  });
  const category = aqiCategory(data?.aqi);

  return (
    <PageScaffold title="Air quality">
      <LocationSearch current={coords} onSelect={setLocation} />
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">US AQI</div>
        <div className="mt-2 flex items-end gap-3">
          <div className="text-5xl font-extralight text-white">{data?.aqi != null ? Math.round(data.aqi) : "—"}</div>
          <div className="mb-1 text-sm text-sky-200">{category.label}</div>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          {category.label === "Good"
            ? "Air quality is satisfactory. Enjoy outdoor time."
            : category.label === "Moderate"
              ? "Acceptable. Sensitive people may notice irritation."
              : "Limit heavy outdoor activity, especially for kids and anyone with asthma."}
        </p>
      </div>
      <StatGrid
        items={[
          { label: "PM2.5", value: data?.pm25 != null ? `${Math.round(data.pm25)}` : null, sub: "µg/m³" },
          { label: "PM10", value: data?.pm10 != null ? `${Math.round(data.pm10)}` : null, sub: "µg/m³" },
          { label: "Ozone", value: data?.o3 != null ? `${Math.round(data.o3)}` : null, sub: "µg/m³" },
          { label: "NO₂", value: data?.no2 != null ? `${Math.round(data.no2)}` : null, sub: "µg/m³" },
          { label: "SO₂", value: data?.so2 != null ? `${Math.round(data.so2)}` : null, sub: "µg/m³" },
          { label: "CO", value: data?.co != null ? `${Math.round(data.co)}` : null, sub: "µg/m³" },
        ]}
      />
    </PageScaffold>
  );
}
