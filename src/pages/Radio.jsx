import { useEffect } from "react";
import { LoaderCircle, Pause, Play, Radio } from "lucide-react";
import PageScaffold from "@/components/more/PageScaffold";
import MobileSelect from "@/components/mobile/MobileSelect";
import useTabPageMemory from "@/hooks/useTabPageMemory";
import { useRadio } from "@/lib/RadioContext";

export default function RadioPage() {
  useTabPageMemory("More");
  const {
    station,
    stationId,
    setStationId,
    isPlaying,
    isBuffering,
    isLocating,
    togglePlayback,
    tuneToNearest,
    stations,
  } = useRadio();

  useEffect(() => {
    tuneToNearest();
  }, [tuneToNearest]);

  const statusLabel = isLocating ? "Finding nearest station" : isBuffering ? "Connecting…" : isPlaying ? "Live NOAA radio" : "Ready to play";

  return (
    <PageScaffold title="Radio">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-emerald-300">
          <Radio className="h-10 w-10" aria-hidden="true" />
        </div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">Weather radio</div>
        <h1 className="mt-1 text-2xl font-semibold text-white">{station.label}</h1>
        <p className="mt-2 text-sm text-slate-300">
          One tap plays live NOAA Weather Radio for the station nearest you.
        </p>
        <div className="mt-3 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          {statusLabel}
        </div>

        <button
          type="button"
          onClick={togglePlayback}
          aria-label={isPlaying ? "Pause weather radio" : "Play weather radio"}
          className="mt-8 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-400 text-slate-950 shadow-xl shadow-black/20"
        >
          {isBuffering ? (
            <LoaderCircle className="h-10 w-10 animate-spin" aria-hidden="true" />
          ) : isPlaying ? (
            <Pause className="h-10 w-10" aria-hidden="true" />
          ) : (
            <Play className="ml-1 h-10 w-10" aria-hidden="true" />
          )}
        </button>

        <div className="mt-8 w-full text-left">
          <MobileSelect
            label="Radio Station"
            value={stationId}
            onChange={setStationId}
            options={stations.map((item) => ({ value: item.id, label: item.label }))}
          />
        </div>
      </div>
    </PageScaffold>
  );
}
