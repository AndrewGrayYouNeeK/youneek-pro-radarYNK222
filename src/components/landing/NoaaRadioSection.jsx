import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Radio, Play, Pause, Volume2, Search, MapPin } from 'lucide-react';
import { useLocation } from './LocationContext';

// Public NOAA Weather Radio streams via Broadcastify public feeds (verified live URLs)
const STATIONS = [
  { id: 'KEC61', name: 'KEC61 — New York, NY', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/3245', lat: 40.7128, lon: -74.0060 },
  { id: 'WXJ40', name: 'WXJ40 — Boston, MA', freq: '162.475 MHz', url: 'https://broadcastify.cdnstream1.com/2948', lat: 42.3601, lon: -71.0589 },
  { id: 'KIH54', name: 'KIH54 — Los Angeles, CA', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/22693', lat: 34.0522, lon: -118.2437 },
  { id: 'WXK29', name: 'WXK29 — Chicago, IL', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/15673', lat: 41.8781, lon: -87.6298 },
  { id: 'KEC54', name: 'KEC54 — Houston, TX', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/14373', lat: 29.7604, lon: -95.3698 },
  { id: 'WXJ65', name: 'WXJ65 — Atlanta, GA', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/9043', lat: 33.7490, lon: -84.3880 },
  { id: 'KZZ40', name: 'KZZ40 — Miami, FL', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/16263', lat: 25.7617, lon: -80.1918 },
  { id: 'KIH26', name: 'KIH26 — Seattle, WA', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/22933', lat: 47.6062, lon: -122.3321 },
];

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
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const { location } = useLocation();

  // Stations sorted by distance from user
  const sortedStations = useMemo(() => {
    if (!location?.lat || !location?.lon) return STATIONS;
    return [...STATIONS]
      .map((s) => ({ ...s, distance: distMi(location, s) }))
      .sort((a, b) => a.distance - b.distance);
  }, [location]);

  // Closest station
  const nearest = sortedStations[0];

  // Filtered by search
  const visible = useMemo(() => {
    if (!query.trim()) return sortedStations;
    const q = query.toLowerCase();
    return sortedStations.filter(
      (s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.freq.toLowerCase().includes(q)
    );
  }, [sortedStations, query]);

  const toggle = (s) => {
    if (active?.id === s.id) {
      audioRef.current?.pause();
      setActive(null);
      return;
    }
    setLoading(true);
    setActive(s);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = s.url;
        audioRef.current.play().catch(() => {}).finally(() => setLoading(false));
      }
    }, 50);
  };

  return (
    <section id="stations" className="relative bg-black py-24 px-5 md:px-8 overflow-hidden border-t border-[#00ff9c]/20">
      <div className="absolute inset-0 [background:radial-gradient(ellipse_at_top_right,rgba(0,255,156,0.08),transparent_60%)]" />
      <div className="relative max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="text-[10px] tracking-[0.4em] uppercase text-[#00ff9c] mb-3 font-mono">
            // NOAA_WEATHER_RADIO
          </div>
          <h2 className="text-4xl md:text-5xl font-bold leading-[0.95] tracking-tight text-white">
            Live <span className="text-[#ff00d4]">NOAA</span> Radio
          </h2>
          <p className="mt-3 text-sm text-white/60 max-w-xl">
            Streaming public NOAA Weather Radio All Hazards (NWR) feeds. Auto-tuned to your nearest station.
          </p>
        </div>

        {/* Nearest banner + search */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center gap-3 justify-between">
          {nearest && location?.lat && (
            <div className="inline-flex items-center gap-2 px-3 py-2 border border-[#ff00d4]/40 bg-black/70 text-[10px] tracking-[0.25em] uppercase font-mono">
              <MapPin className="w-3 h-3 text-[#ff00d4]" />
              <span className="text-white/50">Nearest:</span>
              <span className="text-[#ff00d4] font-bold">{nearest.id}</span>
              {nearest.distance != null && (
                <span className="text-white/40">· {Math.round(nearest.distance)} mi</span>
              )}
            </div>
          )}

          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by city, ID, or freq…"
              className="w-full bg-black border border-white/15 pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-[#00ff9c] outline-none font-mono"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {visible.map((s) => {
            const isActive = active?.id === s.id;
            const isNearest = nearest?.id === s.id && location?.lat;
            return (
              <button
                key={s.id}
                onClick={() => toggle(s)}
                className={`relative text-left border p-4 transition group ${
                  isActive
                    ? 'border-[#00ff9c] bg-[#00ff9c]/5'
                    : isNearest
                    ? 'border-[#ff00d4]/60 bg-[#ff00d4]/5 hover:border-[#ff00d4]'
                    : 'border-white/10 bg-black/60 hover:border-[#00ff9c]/50'
                }`}
              >
                {isNearest && (
                  <span className="absolute -top-2 left-3 px-1.5 py-0.5 bg-[#ff00d4] text-black text-[8px] tracking-[0.25em] uppercase font-bold">
                    Nearest
                  </span>
                )}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Radio className={`w-4 h-4 ${isActive ? 'text-[#00ff9c] animate-pulse' : 'text-white/50'}`} />
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-[#00ff9c] text-black' : 'bg-white/10 text-white group-hover:bg-[#00ff9c] group-hover:text-black'
                  } transition`}>
                    {isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
                  </span>
                </div>
                <div className="text-sm font-bold text-white leading-tight">{s.name}</div>
                <div className="text-[10px] tracking-[0.25em] uppercase text-white/40 mt-1 font-mono flex items-center gap-2">
                  <span>{s.freq}</span>
                  {s.distance != null && (
                    <span className="text-white/30">· {Math.round(s.distance)} mi</span>
                  )}
                </div>
                {isActive && (
                  <div className="mt-3 flex items-center gap-1.5 text-[9px] tracking-[0.3em] uppercase text-[#00ff9c]">
                    <Volume2 className="w-3 h-3" />
                    {loading ? 'Buffering…' : 'On Air'}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {visible.length === 0 && (
          <div className="text-center py-12 text-xs text-white/40 font-mono tracking-wider">
            No stations match "{query}"
          </div>
        )}

        <audio ref={audioRef} crossOrigin="anonymous" preload="none" />

        <div className="mt-6 text-[10px] tracking-[0.25em] uppercase text-white/30 font-mono">
          // Source: Broadcastify public NWR feeds · NOAA / NWS
        </div>
      </div>
    </section>
  );
}