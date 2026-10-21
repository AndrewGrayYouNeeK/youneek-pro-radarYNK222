import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { LOCAL_STATIONS } from "@/components/radar/radioStations";
import { loadActiveLocation } from "@/lib/locationStore";
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

const RadioContext = createContext(null);

export function RadioProvider({ children }) {
  const audioRef = useRef(null);
  const [stationId, setStationId] = useState(LOCAL_STATIONS[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isLocating, setIsLocating] = useState(true);

  const station = useMemo(
    () => LOCAL_STATIONS.find((item) => item.id === stationId) || LOCAL_STATIONS[0],
    [stationId]
  );

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audioRef.current = audio;

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
      audio.pause();
      audio.src = "";
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
    setIsBuffering(false);
    audioRef.current.src = station.streamUrl;
  }, [station]);

  const tunedRef = useRef(false);
  const tuneToNearest = useCallback(() => {
    if (tunedRef.current) return;
    tunedRef.current = true;
    if (!getPref("pref_autoTune", true)) {
      setIsLocating(false);
      return;
    }
    const cached = loadActiveLocation();
    if (cached?.latitude != null && cached?.longitude != null) {
      setStationId(getNearestStation(cached.latitude, cached.longitude).id);
      setIsLocating(false);
    }
    if (!navigator.geolocation) {
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStationId(getNearestStation(position.coords.latitude, position.coords.longitude).id);
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { timeout: 8000 }
    );
  }, []);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
    setIsBuffering(false);
  }, []);

  const togglePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      setIsBuffering(false);
      return;
    }
    setIsBuffering(true);
    if (!audio.src) audio.src = station.streamUrl;
    const playPromise = audio.play();
    if (playPromise?.then) {
      playPromise.then(() => setIsPlaying(true)).catch(() => {
        setIsPlaying(false);
        setIsBuffering(false);
      });
    }
  }, [isPlaying, station.streamUrl]);

  const value = useMemo(() => ({
    station,
    stationId,
    setStationId,
    isPlaying,
    isBuffering,
    isLocating,
    togglePlayback,
    pause,
    tuneToNearest,
    stations: LOCAL_STATIONS,
  }), [station, stationId, isPlaying, isBuffering, isLocating, togglePlayback, pause, tuneToNearest]);

  return <RadioContext.Provider value={value}>{children}</RadioContext.Provider>;
}

export function useRadio() {
  const context = useContext(RadioContext);
  if (!context) throw new Error("useRadio must be used within RadioProvider");
  return context;
}
