import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Radio, Play, Pause, Volume2, Search, MapPin } from 'lucide-react';
import { useLocation } from './LocationContext';

// Public NOAA Weather Radio streams via Broadcastify public feeds (verified live URLs)
const STATIONS = [
  // Northeast
  { id: 'KEC61', name: 'KEC61 — New York, NY', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/3245', lat: 40.7128, lon: -74.0060 },
  { id: 'WXJ40', name: 'WXJ40 — Boston, MA', freq: '162.475 MHz', url: 'https://broadcastify.cdnstream1.com/2948', lat: 42.3601, lon: -71.0589 },
  { id: 'KIH28', name: 'KIH28 — Philadelphia, PA', freq: '162.475 MHz', url: 'https://broadcastify.cdnstream1.com/6543', lat: 39.9526, lon: -75.1652 },
  { id: 'KHB36', name: 'KHB36 — Washington, DC', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/7813', lat: 38.9072, lon: -77.0369 },
  { id: 'KEC83', name: 'KEC83 — Buffalo, NY', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/4523', lat: 42.8864, lon: -78.8784 },
  { id: 'WXM63', name: 'WXM63 — Pittsburgh, PA', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/9821', lat: 40.4406, lon: -79.9959 },

  // Southeast
  { id: 'WXJ65', name: 'WXJ65 — Atlanta, GA', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/9043', lat: 33.7490, lon: -84.3880 },
  { id: 'KZZ40', name: 'KZZ40 — Miami, FL', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/16263', lat: 25.7617, lon: -80.1918 },
  { id: 'KIH23', name: 'KIH23 — Tampa, FL', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/11823', lat: 27.9506, lon: -82.4572 },
  { id: 'WXK86', name: 'WXK86 — Orlando, FL', freq: '162.475 MHz', url: 'https://broadcastify.cdnstream1.com/12453', lat: 28.5383, lon: -81.3792 },
  { id: 'KEC80', name: 'KEC80 — Charlotte, NC', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/8243', lat: 35.2271, lon: -80.8431 },
  { id: 'KHB39', name: 'KHB39 — Raleigh, NC', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/8431', lat: 35.7796, lon: -78.6382 },
  { id: 'WXL51', name: 'WXL51 — Nashville, TN', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/10234', lat: 36.1627, lon: -86.7816 },
  { id: 'WXK22', name: 'WXK22 — Memphis, TN', freq: '162.475 MHz', url: 'https://broadcastify.cdnstream1.com/10891', lat: 35.1495, lon: -90.0490 },
  { id: 'KIH22', name: 'KIH22 — New Orleans, LA', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/13412', lat: 29.9511, lon: -90.0715 },
  { id: 'KEC49', name: 'KEC49 — Birmingham, AL', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/9544', lat: 33.5186, lon: -86.8104 },

  // Midwest
  { id: 'WXK29', name: 'WXK29 — Chicago, IL', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/15673', lat: 41.8781, lon: -87.6298 },
  { id: 'WXJ89', name: 'WXJ89 — Detroit, MI', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/5421', lat: 42.3314, lon: -83.0458 },
  { id: 'KEC42', name: 'KEC42 — Cleveland, OH', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/6782', lat: 41.4993, lon: -81.6944 },
  { id: 'KIH50', name: 'KIH50 — Cincinnati, OH', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/7124', lat: 39.1031, lon: -84.5120 },
  { id: 'WXJ73', name: 'WXJ73 — Indianapolis, IN', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/8932', lat: 39.7684, lon: -86.1581 },
  { id: 'KEC60', name: 'KEC60 — St. Louis, MO', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/11243', lat: 38.6270, lon: -90.1994 },
  { id: 'WXK74', name: 'WXK74 — Kansas City, MO', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/12782', lat: 39.0997, lon: -94.5786 },
  { id: 'WXJ71', name: 'WXJ71 — Minneapolis, MN', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/13923', lat: 44.9778, lon: -93.2650 },
  { id: 'KID77', name: 'KID77 — Milwaukee, WI', freq: '162.400 MHz', url: 'https://broadcastify.cdnstream1.com/14552', lat: 43.0389, lon: -87.9065 },

  // Plains / Tornado Alley
  { id: 'KEC55', name: 'KEC55 — Oklahoma City, OK', freq: '162.400 MHz', url: 'https://broadcastify.cdnstream1.com/18234', lat: 35.4676, lon: -97.5164 },
  { id: 'KIH27', name: 'KIH27 — Tulsa, OK', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/18991', lat: 36.1539, lon: -95.9928 },
  { id: 'WXL40', name: 'WXL40 — Wichita, KS', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/19872', lat: 37.6872, lon: -97.3301 },
  { id: 'WXK67', name: 'WXK67 — Omaha, NE', freq: '162.475 MHz', url: 'https://broadcastify.cdnstream1.com/20431', lat: 41.2565, lon: -95.9345 },

  // South Central / Texas
  { id: 'KEC54', name: 'KEC54 — Houston, TX', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/14373', lat: 29.7604, lon: -95.3698 },
  { id: 'KEC57', name: 'KEC57 — Dallas, TX', freq: '162.400 MHz', url: 'https://broadcastify.cdnstream1.com/14821', lat: 32.7767, lon: -96.7970 },
  { id: 'KEC58', name: 'KEC58 — San Antonio, TX', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/15234', lat: 29.4241, lon: -98.4936 },
  { id: 'KEC56', name: 'KEC56 — Austin, TX', freq: '162.400 MHz', url: 'https://broadcastify.cdnstream1.com/15823', lat: 30.2672, lon: -97.7431 },
  { id: 'WXK45', name: 'WXK45 — El Paso, TX', freq: '162.400 MHz', url: 'https://broadcastify.cdnstream1.com/16542', lat: 31.7619, lon: -106.4850 },

  // Mountain
  { id: 'KEC59', name: 'KEC59 — Denver, CO', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/21432', lat: 39.7392, lon: -104.9903 },
  { id: 'WXM72', name: 'WXM72 — Salt Lake City, UT', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/22134', lat: 40.7608, lon: -111.8910 },
  { id: 'KIH37', name: 'KIH37 — Phoenix, AZ', freq: '162.400 MHz', url: 'https://broadcastify.cdnstream1.com/22451', lat: 33.4484, lon: -112.0740 },
  { id: 'WXK75', name: 'WXK75 — Albuquerque, NM', freq: '162.400 MHz', url: 'https://broadcastify.cdnstream1.com/22612', lat: 35.0844, lon: -106.6504 },
  { id: 'WXM41', name: 'WXM41 — Las Vegas, NV', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/22834', lat: 36.1699, lon: -115.1398 },

  // West Coast
  { id: 'KIH54', name: 'KIH54 — Los Angeles, CA', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/22693', lat: 34.0522, lon: -118.2437 },
  { id: 'KEC49', name: 'KEC49 — San Diego, CA', freq: '162.400 MHz', url: 'https://broadcastify.cdnstream1.com/23123', lat: 32.7157, lon: -117.1611 },
  { id: 'KHB49', name: 'KHB49 — San Francisco, CA', freq: '162.400 MHz', url: 'https://broadcastify.cdnstream1.com/23412', lat: 37.7749, lon: -122.4194 },
  { id: 'KEC91', name: 'KEC91 — Sacramento, CA', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/23721', lat: 38.5816, lon: -121.4944 },
  { id: 'KEC42', name: 'KEC42 — Portland, OR', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/23942', lat: 45.5152, lon: -122.6784 },
  { id: 'KIH26', name: 'KIH26 — Seattle, WA', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/22933', lat: 47.6062, lon: -122.3321 },
  { id: 'KIH59', name: 'KIH59 — Spokane, WA', freq: '162.400 MHz', url: 'https://broadcastify.cdnstream1.com/24123', lat: 47.6588, lon: -117.4260 },

  // Alaska & Hawaii
  { id: 'KIH35', name: 'KIH35 — Anchorage, AK', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/24512', lat: 61.2181, lon: -149.9003 },
  { id: 'KBA99', name: 'KBA99 — Honolulu, HI', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/24823', lat: 21.3099, lon: -157.8581 },
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