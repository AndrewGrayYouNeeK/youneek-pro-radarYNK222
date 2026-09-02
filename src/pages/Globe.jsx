import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Flame, LocateFixed, Pause, Play, RotateCcw } from "lucide-react";
import AppHeader from "@/components/mobile/AppHeader";
import BottomTab from "@/components/radar/BottomTab";
import GlobeCanvas from "@/components/globe/GlobeCanvas";
import useTabPageMemory from "@/hooks/useTabPageMemory";
import useWeatherLocation from "@/hooks/useWeatherLocation";
import { fetchFires, fetchLightning, fetchActiveStorms } from "@/lib/api/outlook";
import { fetchOpenMeteo, adaptOpenMeteoCurrent } from "@/lib/weather/openmeteo";
import { buildMercatorMosaic, fetchRainViewerCatalog, formatRadarClock } from "@/lib/weather/rainviewer";
import { describeWeatherCode } from "@/lib/weather/conditions";
import { nearestPoint } from "@/lib/geo";

const LAYERS = [
  { id: "radar", label: "Radar" },
  { id: "future", label: "Future" },
  { id: "satellite", label: "Satellite" },
  { id: "off", label: "Earth" },
];

export default function Globe() {
  useTabPageMemory("Globe");
  const globeRef = useRef(null);
  const { coords } = useWeatherLocation();
  const userLocation = coords
    ? { lat: coords.latitude, lon: coords.longitude, label: coords.label }
    : null;

  const [layer, setLayer] = useState("radar");
  const [showLightning, setShowLightning] = useState(true);
  const [showStorms, setShowStorms] = useState(true);
  const [showFires, setShowFires] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(700);
  const [frameIndex, setFrameIndex] = useState(0);
  const [radarCanvas, setRadarCanvas] = useState(null);
  const [mosaicLoading, setMosaicLoading] = useState(false);
  const [picked, setPicked] = useState(null);
  const mosaicCache = useRef(new Map());

  const catalogQuery = useQuery({
    queryKey: ["rainviewer-catalog"],
    queryFn: fetchRainViewerCatalog,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 60 * 1000,
  });
  const lightningQuery = useQuery({
    queryKey: ["globe-lightning"],
    queryFn: fetchLightning,
    refetchInterval: 60 * 1000,
  });
  const stormsQuery = useQuery({
    queryKey: ["globe-storms"],
    queryFn: fetchActiveStorms,
    refetchInterval: 5 * 60 * 1000,
  });
  const firesQuery = useQuery({
    queryKey: ["globe-fires"],
    queryFn: fetchFires,
    staleTime: 5 * 60 * 1000,
  });

  const frames = useMemo(() => {
    const catalog = catalogQuery.data;
    if (!catalog) return [];
    if (layer === "satellite") return catalog.satellite;
    if (layer === "future") return catalog.nowcast.length ? catalog.nowcast : catalog.radar;
    if (layer === "radar") return catalog.radar;
    return [];
  }, [catalogQuery.data, layer]);

  useEffect(() => {
    if (!frames.length) {
      setFrameIndex(0);
      return;
    }
    const liveIndex = frames.findIndex((frame) => frame.kind === "future");
    setFrameIndex(liveIndex > 0 ? liveIndex - 1 : Math.max(0, frames.length - 1));
  }, [frames]);

  useEffect(() => {
    if (!playing || frames.length < 2 || layer === "off") return undefined;
    const timer = window.setInterval(() => {
      setFrameIndex((current) => (current + 1) % frames.length);
    }, speed);
    return () => window.clearInterval(timer);
  }, [playing, frames.length, speed, layer]);

  const activeFrame = frames[frameIndex] || null;

  useEffect(() => {
    let cancelled = false;
    if (!activeFrame || layer === "off") {
      setRadarCanvas(null);
      return undefined;
    }
    const cacheKey = `${activeFrame.path}:${activeFrame.kind}`;
    if (mosaicCache.current.has(cacheKey)) {
      setRadarCanvas(mosaicCache.current.get(cacheKey));
      return undefined;
    }
    setMosaicLoading(true);
    buildMercatorMosaic(activeFrame, 2, layer === "satellite" ? 0 : 2)
      .then((canvas) => {
        if (cancelled) return;
        mosaicCache.current.set(cacheKey, canvas);
        setRadarCanvas(canvas);
      })
      .finally(() => {
        if (!cancelled) setMosaicLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeFrame, layer]);

  const pickQuery = useQuery({
    queryKey: ["globe-pick", picked?.lat, picked?.lon],
    enabled: Boolean(picked),
    queryFn: async () => {
      const payload = await fetchOpenMeteo(picked.lat, picked.lon);
      return adaptOpenMeteoCurrent(payload);
    },
  });

  const storms = stormsQuery.data?.activeStorms || stormsQuery.data?.currentStorms || [];
  const lightning = lightningQuery.data?.strikes || [];
  const fires = [
    ...(firesQuery.data?.events || []),
    ...(firesQuery.data?.detections || []).slice(0, 160),
  ];

  const nearestStrike = userLocation
    ? nearestPoint(userLocation, lightning, (strike) => strike)
    : null;

  const handlePick = useCallback((point) => {
    setPicked(point);
    setAutoRotate(false);
  }, []);

  const handleLocate = () => {
    if (!userLocation) return;
    setAutoRotate(false);
    globeRef.current?.flyTo(userLocation.lat, userLocation.lon);
    setPicked({ lat: userLocation.lat, lon: userLocation.lon });
  };

  const frameKind = activeFrame?.kind;
  const pickCurrent = pickQuery.data?.current;
  const pickCode = describeWeatherCode(pickCurrent?.weather_code);

  return (
    <div className="flex h-[100dvh] flex-col bg-slate-950 pb-0">
      <AppHeader title="3D Radar Globe" />
      <div className="relative min-h-0 flex-1 pb-16">
        <GlobeCanvas
          ref={globeRef}
          radarCanvas={layer === "off" ? null : radarCanvas}
          radarOpacity={layer === "satellite" ? 0.62 : 0.88}
          lightning={showLightning ? lightning : []}
          storms={showStorms ? storms : []}
          fires={showFires ? fires : []}
          userLocation={userLocation}
          autoRotate={autoRotate}
          onPick={handlePick}
        />

        <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center px-3">
          <div className="pointer-events-auto flex max-w-md flex-wrap items-center justify-center gap-1 rounded-2xl border border-white/10 bg-slate-950/80 p-1 backdrop-blur-md">
            {LAYERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setLayer(item.id);
                  if (item.id !== "off") setPlaying(true);
                }}
                className={`rounded-xl px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                  layer === item.id ? "bg-cyan-500 text-slate-950" : "text-slate-300"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {nearestStrike && nearestStrike.miles <= 25 && nearestStrike.item.kind === "lightning" && (
          <div className="absolute left-3 top-16 z-10 max-w-[14rem] rounded-2xl border border-yellow-400/40 bg-yellow-950/85 px-3 py-2 text-xs text-yellow-50">
            Lightning {nearestStrike.miles.toFixed(1)} mi away · Spark-style proximity
          </div>
        )}

        <div className="pointer-events-none absolute right-3 top-16 z-10 flex w-36 flex-col gap-2">
          <div className="pointer-events-auto rounded-2xl border border-white/10 bg-slate-950/80 p-2 text-[11px] text-slate-200 backdrop-blur-md">
            <label className="flex items-center justify-between gap-2 py-1">
              Lightning
              <input type="checkbox" checked={showLightning} onChange={(e) => setShowLightning(e.target.checked)} />
            </label>
            <label className="flex items-center justify-between gap-2 py-1">
              Hurricanes
              <input type="checkbox" checked={showStorms} onChange={(e) => setShowStorms(e.target.checked)} />
            </label>
            <label className="flex items-center justify-between gap-2 py-1">
              <span className="inline-flex items-center gap-1"><Flame className="h-3 w-3" /> Fires</span>
              <input type="checkbox" checked={showFires} onChange={(e) => setShowFires(e.target.checked)} />
            </label>
          </div>
        </div>

        {picked && (
          <div className="absolute left-3 bottom-28 z-10 w-[min(18rem,calc(100vw-1.5rem))] rounded-2xl border border-white/10 bg-slate-950/88 p-3 text-xs text-slate-200 backdrop-blur-md">
            <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Inspect</div>
            <div className="mt-1 font-semibold text-white">
              {picked.lat.toFixed(2)}°, {picked.lon.toFixed(2)}°
            </div>
            {pickCurrent ? (
              <p className="mt-1 text-slate-300">
                {Math.round(pickCurrent.temperature_2m ?? 0)}° · {pickCode.label} · wind{" "}
                {Math.round(pickCurrent.wind_speed_10m ?? 0)} mph
              </p>
            ) : (
              <p className="mt-1 text-slate-500">Reading conditions…</p>
            )}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-16 z-10 px-3 pb-2">
          <div className="mx-auto flex max-w-md items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/88 px-3 py-2 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setPlaying((value) => !value)}
              disabled={layer === "off"}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-40"
              aria-label={playing ? "Pause globe radar" : "Play globe radar"}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <div className="min-w-0 flex-1">
              <input
                type="range"
                min={0}
                max={Math.max(0, frames.length - 1)}
                value={Math.min(frameIndex, Math.max(0, frames.length - 1))}
                onChange={(event) => {
                  setPlaying(false);
                  setFrameIndex(Number(event.target.value));
                }}
                disabled={!frames.length || layer === "off"}
                className="w-full accent-cyan-400"
                aria-label="Radar time"
              />
              <div className="mt-0.5 flex justify-between text-[10px] uppercase tracking-[0.12em] text-slate-400">
                <span>{mosaicLoading ? "Painting tiles…" : formatRadarClock(activeFrame?.time)}</span>
                <span className={frameKind === "future" ? "text-fuchsia-300" : "text-cyan-300"}>
                  {layer === "off" ? "No overlay" : frameKind === "future" ? "Future radar" : frameKind === "satellite" ? "Satellite IR" : "Live radar"}
                </span>
              </div>
            </div>
            <select
              value={speed}
              onChange={(event) => setSpeed(Number(event.target.value))}
              aria-label="Globe loop speed"
              className="rounded-lg border border-white/10 bg-slate-900 px-1.5 py-1 text-[11px] text-white"
            >
              <option value={1100}>Slow</option>
              <option value={700}>Med</option>
              <option value={320}>Fast</option>
            </select>
            <button
              type="button"
              onClick={() => setAutoRotate((value) => !value)}
              className={`flex h-9 w-9 items-center justify-center rounded-full ${autoRotate ? "bg-cyan-500/20 text-cyan-200" : "bg-white/10 text-white"}`}
              aria-label="Toggle auto rotate"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleLocate}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600/80 text-white"
              aria-label="Fly to my location"
            >
              <LocateFixed className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <BottomTab />
    </div>
  );
}
