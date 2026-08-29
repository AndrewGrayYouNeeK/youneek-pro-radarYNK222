import { useEffect, useMemo, useRef, useState } from "react";
import { Radio, Play, Pause, LocateFixed, LoaderCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { LOCAL_STATIONS } from "./radioStations";
import MobileSelect from "@/components/mobile/MobileSelect";
import { getPref } from "@/lib/prefs";

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getNearestStation(lat, lon) {
  return LOCAL_STATIONS.reduce((best, station) => {
    const distance = haversine(lat, lon, station.lat, station.lon);
    return distance < best.distance ? { station, distance } : best;
  }, { station: LOCAL_STATIONS[0], distance: Infinity }).station;
}

export default function RadioControls({ showRadio, onShowRadioChange }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isLocating, setIsLocating] = useState(true);
  const [stationId, setStationId] = useState(LOCAL_STATIONS[0].id);

  const station = useMemo(
    () => LOCAL_STATIONS.find((item) => item.id === stationId) || LOCAL_STATIONS[0],
    [stationId]
  );

  useEffect(() => {
    if (!getPref("pref_autoTune", true)) {
      setIsLocating(false);
      return;
    }
    if (!navigator.geolocation) {
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nearest = getNearestStation(position.coords.latitude, position.coords.longitude);
        setStationId(nearest.id);
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    // Stop playback when station changes so the user explicitly presses play for the new stream
    audioRef.current.pause();
    setIsPlaying(false);
    setIsBuffering(false);
    audioRef.current.src = station.streamUrl;
  }, [station]);

  useEffect(() => {
    if (!showRadio && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsBuffering(false);
    }
  }, [showRadio]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlaying = () => {
      setIsPlaying(true);
      setIsBuffering(false);
    };
    const handlePause = () => {
      setIsPlaying(false);
      setIsBuffering(false);
    };
    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);
    const handleError = () => {
      setIsPlaying(false);
      setIsBuffering(false);
    };

    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsBuffering(false);
      return;
    }

    setIsBuffering(true);
    const playPromise = audioRef.current.play();
    if (playPromise?.then) {
      playPromise.then(() => setIsPlaying(true)).finally(() => setIsBuffering(false));
      return;
    }

    setIsPlaying(true);
    setIsBuffering(false);
  };

  const statusLabel = isLocating ? "Finding nearest" : isBuffering ? "Connecting…" : isPlaying ? "Live" : "Ready";
  const statusTone = isPlaying ? "text-emerald-300 bg-emerald-500/15 border-emerald-500/30" : "text-slate-300 bg-white/5 border-white/10";

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-3">
      <audio ref={audioRef} preload="none" />
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Radio</div>
          <div className="mt-1 text-xs text-slate-500">Live NOAA weather audio for your nearest station.</div>
        </div>
        <Switch checked={showRadio} onCheckedChange={onShowRadioChange} aria-label="Toggle weather radio" />
      </div>

      {showRadio ? (
        <>
          <div className="rounded-xl border border-white/10 bg-slate-900/70 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] font-mono font-bold tracking-widest text-slate-200">
                  <Radio size={12} aria-hidden="true" />
                  NOAA WEATHER RADIO
                </div>
                <div className="mt-2 truncate text-sm font-semibold text-white">{station.label.replace(/^\w+\s/, "")}</div>
              </div>
              <div className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold ${statusTone}`}>
                {isLocating ? <LocateFixed size={11} className="animate-pulse" aria-hidden="true" /> : isBuffering ? <LoaderCircle size={11} className="animate-spin" aria-hidden="true" /> : <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />}
                {statusLabel}
              </div>
            </div>
          </div>

          <MobileSelect
            label="Radio Station"
            value={stationId}
            onChange={setStationId}
            options={LOCAL_STATIONS.map((item) => ({ value: item.id, label: item.label }))}
          />

          <button
            onClick={togglePlayback}
            aria-label={isPlaying ? "Stop local NOAA weather radio" : "Play local NOAA weather radio"}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-3 text-sm font-semibold text-emerald-200 transition-colors hover:bg-emerald-500/20"
          >
            {isBuffering ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : isPlaying ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
            {isBuffering ? "Connecting…" : isPlaying ? "Stop Live Radio" : "Play Live Radio"}
          </button>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 bg-slate-900/40 px-3 py-3 text-[11px] text-slate-400">
          Turn radio on to pick a station and start live audio.
        </div>
      )}
    </div>
  );
}