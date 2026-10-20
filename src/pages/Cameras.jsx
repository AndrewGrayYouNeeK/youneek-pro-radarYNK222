import { useState } from "react";
import { camerasNear } from "@/lib/api/cameras";
import { formatDistance } from "@/lib/units";
import { useUnits } from "@/lib/UnitsContext";
import PageScaffold from "@/components/more/PageScaffold";
import LocationPicker from "@/components/forecast/LocationPicker";
import useWeatherLocation from "@/hooks/useWeatherLocation";

function CameraCard({ camera, distance }) {
  const [failed, setFailed] = useState(false);

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      {failed ? (
        <div className="flex h-40 items-center justify-center bg-slate-900 px-4 text-center text-xs text-slate-400">
          Live image is unavailable right now. The NOAA feed for {camera.name} did not load.
        </div>
      ) : (
        <img
          src={camera.image}
          alt={camera.name}
          className="h-40 w-full object-cover bg-slate-900"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
      <div className="px-3 py-2">
        <div className="text-sm font-medium text-white">{camera.name}</div>
        <div className="text-[11px] text-slate-400">
          {camera.region}
          {distance}
        </div>
      </div>
    </article>
  );
}

export default function Cameras() {
  const { coords } = useWeatherLocation();
  const { units } = useUnits();
  const cameras = camerasNear(coords, 10);

  return (
    <PageScaffold title="Weather cameras">
      <LocationPicker />
      <p className="text-xs text-slate-400">
        Live NOAA GOES GeoColor sectors and the national NWS radar mosaic, sorted by distance from you.
      </p>
      <div className="space-y-3">
        {cameras.map((camera) => (
          <CameraCard
            key={camera.id}
            camera={camera}
            distance={camera.distanceMi != null ? ` · ${formatDistance(camera.distanceMi, units)}` : ""}
          />
        ))}
      </div>
    </PageScaffold>
  );
}
