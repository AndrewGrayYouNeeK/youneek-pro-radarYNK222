import React, { useRef, useState, useMemo } from 'react';
import { Radio, Play, Pause, Volume2, MapPin, Loader2 } from 'lucide-react';
import { useLocation } from './LocationContext';
import { NOAA_STATIONS } from './noaaStations';

const STATIONS = NOAA_STATIONS;

// Haversine miles
const distMi = (a, b) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
};

export default function NoaaRadioSection() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const { location } = useLocation();

  // Nearest station based on GPS / saved location
  const nearest = useMemo(() => {
    if (!location?.lat || !location?.lon) return null;
    let best = null;
    for (const s of STATIONS) {
      const d = distMi(location, s);
      if (!best || d < best.distance) best = { ...s, distance: d };
    }
    return best;
  }, [location]);

  const toggle = () => {
    if (!nearest) return;
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      return;
    }
    setLoading(true);
    setPlaying(true);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = nearest.url;
        audioRef.current.play().catch(() => {}).finally(() => setLoading(false));
      }
    }, 50);
  };

  return (
    <section id="stations" className="relative bg-black py-24 px-5 md:px-8 overflow-hidden border-t border-[#00ff9c]/20">
      <div className="absolute inset-0 [background:radial-gradient(ellipse_at_top_right,rgba(0,255,156,0.08),transparent_60%)]" />
      <div className="relative max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="text-[10px] tracking-[0.4em] uppercase text-[#00ff9c] mb-3 font-mono">
            // NOAA_WEATHER_RADIO
          </div>
          <h2 className="text-4xl md:text-5xl font-bold leading-[0.95] tracking-tight text-white">
            Your Local <span className="text-[#ff00d4]">NOAA</span> Radio
          </h2>
          <p className="mt-3 text-sm text-white/60 max-w-xl">
            Auto-tuned to the closest NOAA Weather Radio All Hazards (NWR) transmitter based on your GPS location.
          </p>
        </div>

        {!nearest && (
          <div className="border border-white/10 bg-black/60 p-6 text-center">
            <MapPin className="w-5 h-5 text-[#ff00d4] mx-auto mb-3" />
            <div className="text-sm text-white/70 mb-1">Location required</div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-white/40 font-mono">
              Set your location at the top of the page to tune in
            </div>
          </div>
        )}

        {nearest && (
          <div className="relative border border-[#ff00d4]/50 bg-black/80 p-6 md:p-8">
            <span className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-[#ff00d4]" />
            <span className="absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 border-[#00ff9c]" />
            <span className="absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 border-[#00ff9c]" />
            <span className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-[#ff00d4]" />

            <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase font-mono text-[#ff00d4] mb-4">
              <MapPin className="w-3 h-3" />
              Nearest Station · {Math.round(nearest.distance)} mi from {location.label}
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <button
                onClick={toggle}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center transition shrink-0 ${
                  playing ? 'bg-[#00ff9c] text-black' : 'bg-white text-black hover:bg-[#00ff9c]'
                }`}
              >
                {playing && (
                  <span className="absolute inset-0 rounded-full bg-[#00ff9c] opacity-40 animate-ping" />
                )}
                {loading ? (
                  <Loader2 className="w-7 h-7 animate-spin relative" />
                ) : playing ? (
                  <Pause className="w-7 h-7 relative" />
                ) : (
                  <Play className="w-7 h-7 ml-1 relative" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Radio className={`w-4 h-4 ${playing ? 'text-[#00ff9c] animate-pulse' : 'text-white/60'}`} />
                  <span className="text-[10px] tracking-[0.3em] uppercase font-mono text-[#00ff9c]">
                    {playing ? (loading ? 'Buffering…' : 'On Air') : 'Standby'}
                  </span>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white leading-tight">
                  {nearest.name}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] tracking-[0.25em] uppercase text-white/50 font-mono">
                  <span><span className="text-white/30">CALL </span>{nearest.id}</span>
                  <span><span className="text-white/30">FREQ </span>{nearest.freq}</span>
                  <span><span className="text-white/30">DIST </span>{Math.round(nearest.distance)} mi</span>
                </div>
              </div>
            </div>

            {playing && (
              <div className="mt-5 flex items-center gap-2 text-[9px] tracking-[0.3em] uppercase text-[#00ff9c] font-mono">
                <Volume2 className="w-3 h-3" />
                Live audio · NOAA / NWS
              </div>
            )}
          </div>
        )}

        <audio ref={audioRef} crossOrigin="anonymous" preload="none" />

        <div className="mt-6 text-[10px] tracking-[0.25em] uppercase text-white/30 font-mono">
          // Source: Broadcastify public NWR feeds · NOAA / NWS · {STATIONS.length}+ transmitters indexed
        </div>
      </div>
    </section>
  );
}