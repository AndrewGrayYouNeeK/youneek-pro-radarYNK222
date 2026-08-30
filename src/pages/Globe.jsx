import { useCallback, useState } from "react";
import { Flame, LocateFixed, Pause, Play, Satellite, Zap } from "lucide-react";
import AppHeader from "@/components/mobile/AppHeader";
import BottomTab from "@/components/radar/BottomTab";
import WeatherGlobeCanvas from "@/components/globe/WeatherGlobeCanvas";
import useTabPageMemory from "@/hooks/useTabPageMemory";
import useWeatherLocation from "@/hooks/useWeatherLocation";

export default function Globe() {
  useTabPageMemory("Globe");
  const { coords, setLocation, retry } = useWeatherLocation();
  const [layer, setLayer] = useState("radar");
  const [playing, setPlaying] = useState(true);
  const [showLightning, setShowLightning] = useState(true);
  const [showStorms, setShowStorms] = useState(true);
  const [showFires, setShowFires] = useState(true);
  const [flyToken, setFlyToken] = useState(0);
  const [status, setStatus] = useState({ frameLabel: "Loading radar…", kind: "live" });

  const handleStatus = useCallback((next) => {
    setStatus(next);
  }, []);

  return (
    <div className="flex h-[100dvh] flex-col bg-slate-950 pb-0">
      <AppHeader title="3D Radar Globe" />
      <div className="relative min-h-0 flex-1 pb-16">
        <WeatherGlobeCanvas
          coords={coords}
          layer={layer}
          playing={playing}
          showLightning={showLightning}
          showStorms={showStorms}
          showFires={showFires}
          flyToken={flyToken}
          onStatus={handleStatus}
        />

        <div className="pointer-events-none absolute left-3 top-3 max-w-[16rem] rounded-2xl border border-white/10 bg-slate-950/75 p-3 text-xs text-slate-200 backdrop-blur-md">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-300">
            {layer === "satellite" ? "Infrared satellite" : "Global weather radar"}
          </div>
          <div className="mt-1 text-sm font-medium text-white">
            {status.frameLabel || "Live"}
            {status.kind === "nowcast" ? " · Future" : ""}
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
            Drag to rotate. Pinch or scroll to zoom. Radar and future nowcast are included — no premium unlock.
          </p>
        </div>

        <div className="pointer-events-auto absolute right-3 top-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-slate-950/80 text-white backdrop-blur-md"
            aria-label={playing ? "Pause radar loop" : "Play radar loop"}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => {
              retry();
              setFlyToken((value) => value + 1);
            }}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-slate-950/80 text-white backdrop-blur-md"
            aria-label="Fly globe to my location"
          >
            <LocateFixed className="h-4 w-4" />
          </button>
        </div>

        <div className="pointer-events-auto absolute inset-x-3 bottom-24 flex flex-col gap-2">
          <div className="flex gap-2 overflow-x-auto">
            <LayerChip
              active={layer === "radar"}
              onClick={() => setLayer("radar")}
              label="Radar + nowcast"
            />
            <LayerChip
              active={layer === "satellite"}
              onClick={() => setLayer("satellite")}
              icon={Satellite}
              label="Satellite"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            <LayerChip
              active={showLightning}
              onClick={() => setShowLightning((value) => !value)}
              icon={Zap}
              label="Lightning"
            />
            <LayerChip
              active={showStorms}
              onClick={() => setShowStorms((value) => !value)}
              label="Hurricanes"
            />
            <LayerChip
              active={showFires}
              onClick={() => setShowFires((value) => !value)}
              icon={Flame}
              label="Wildfires"
            />
            {coords?.label && (
              <button
                type="button"
                onClick={() => setLocation(coords)}
                className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-1.5 text-[11px] text-slate-300"
              >
                {coords.label}
              </button>
            )}
          </div>
        </div>
      </div>
      <BottomTab />
    </div>
  );
}

function LayerChip({ active, onClick, label, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium backdrop-blur-md ${
        active
          ? "border-sky-400/40 bg-sky-500/20 text-white"
          : "border-white/10 bg-slate-950/75 text-slate-400"
      }`}
    >
      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
      {label}
    </button>
  );
}
