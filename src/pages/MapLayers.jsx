import { useState } from "react";
import AppHeader from "@/components/mobile/AppHeader";
import BottomTab from "@/components/radar/BottomTab";
import useTabPageMemory from "@/hooks/useTabPageMemory";
import { Switch } from "@/components/ui/switch";
import { loadRadarLayers, saveRadarLayers } from "@/lib/radarLayers";

const GROUPS = [
  {
    title: "Map imagery",
    rows: [
      ["radar", "Radar", "Live NEXRAD, and the RainViewer past plus future loop when you press play"],
      ["satellite", "Satellite", "GOES East visible imagery"],
      ["temps", "Temperature", "GOES infrared cloud-top temperatures. This is not a surface-temperature map."],
      ["clouds", "Clouds", "GOES water-vapor imagery"],
      ["precip", "Precipitation", "MRMS precipitation accumulated over the last 24 hours"],
      ["wind", "Wind", "Animated wind from Open-Meteo samples across the map"],
    ],
  },
  {
    title: "Storms",
    rows: [
      ["lightning", "Lightning", "Recent local storm reports. This is not a live strike network."],
      ["storms", "Hurricane tracks", "NHC position, past track, forecast track, and cone"],
      ["cells", "Storm cells", "Hail, wind, and tornado reports from the last 6 hours"],
      ["fires", "Wildfires", "NASA EONET and FIRMS detections"],
    ],
  },
  {
    title: "NWS warning polygons",
    rows: [
      ["alertTornado", "Tornado", "Tornado warnings drawn on the map"],
      ["alertSevere", "Severe thunderstorm", "Severe thunderstorm warnings"],
      ["alertFlood", "Flood", "Flood warnings"],
      ["alertWinter", "Winter", "Winter storm warnings"],
      ["alertHeat", "Heat", "Heat warnings"],
      ["alertWind", "Wind", "High-wind warnings"],
      ["alertFire", "Fire weather", "Red-flag warnings"],
    ],
  },
];

export default function MapLayers() {
  useTabPageMemory("More");
  const [layers, setLayers] = useState(loadRadarLayers);

  const toggle = (key) => (value) => {
    const next = saveRadarLayers({ [key]: value });
    setLayers(next);
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-slate-950">
      <AppHeader title="Map layers" />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-28 pt-4">
        <div className="mx-auto max-w-3xl space-y-4">
          <p className="text-sm text-slate-300">
            These switches stay on the radar map. The map itself only shows the layer chips and the loop bar.
          </p>
          {GROUPS.map((group) => (
            <section key={group.title} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <h2 className="border-b border-white/5 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {group.title}
              </h2>
              <div className="divide-y divide-white/5">
                {group.rows.map(([key, label, detail]) => (
                  <div key={key} className="flex items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-white">{label}</div>
                      <div className="mt-0.5 text-xs text-slate-400">{detail}</div>
                    </div>
                    <Switch checked={Boolean(layers[key])} onCheckedChange={toggle(key)} aria-label={`Toggle ${label}`} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
      <BottomTab />
    </div>
  );
}
