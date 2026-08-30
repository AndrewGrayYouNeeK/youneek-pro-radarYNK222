import { camerasNear } from "@/lib/api/cameras";
import { formatDistance } from "@/lib/units";
import { useUnits } from "@/lib/UnitsContext";
import PageScaffold from "@/components/more/PageScaffold";
import LocationSearch from "@/components/location/LocationSearch";
import useWeatherLocation from "@/hooks/useWeatherLocation";

export default function Cameras() {
  const { coords, setLocation } = useWeatherLocation();
  const { units } = useUnits();
  const cameras = camerasNear(coords, 10);

  return (
    <PageScaffold title="Weather cameras">
      <LocationSearch current={coords} onSelect={setLocation} />
      <p className="text-xs text-slate-400">
        Live NOAA GOES GeoColor sectors and the national NWS radar mosaic, sorted by distance from you.
      </p>
      <div className="space-y-3">
        {cameras.map((camera) => (
          <article key={camera.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <img
              src={camera.image}
              alt={camera.name}
              className="h-40 w-full object-cover bg-slate-900"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
            <div className="px-3 py-2">
              <div className="text-sm font-medium text-white">{camera.name}</div>
              <div className="text-[11px] text-slate-400">
                {camera.region}
                {camera.distanceMi != null ? ` · ${formatDistance(camera.distanceMi, units)}` : ""}
              </div>
            </div>
          </article>
        ))}
      </div>
    </PageScaffold>
  );
}
