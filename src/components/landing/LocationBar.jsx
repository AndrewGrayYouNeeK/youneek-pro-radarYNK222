import React, { useState } from 'react';
import { MapPin, Search, Crosshair, Loader2, X } from 'lucide-react';
import { useLocation } from './LocationContext';
import RainSplash from './RainSplash';

export default function LocationBar() {
  const { location, setLocation, detectGPS, search } = useLocation();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const r = await search(q.trim());
      setResults(r);
      if (r.length === 0) setError('No matches found');
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const pick = (r) => {
    setLocation({
      label: r.label || `${r.city}, ${r.state}`,
      city: r.city, state: r.state, lat: r.lat, lon: r.lon,
    });
    setOpen(false);
    setResults([]);
    setQ('');
  };

  const handleGPS = async () => {
    setGpsLoading(true);
    setError(null);
    try { await detectGPS(); setOpen(false); }
    catch (e) { setError(e.message || 'GPS denied'); }
    finally { setGpsLoading(false); }
  };

  return (
    <div className="relative z-[70]">
      <button
        onClick={() => setOpen(!open)}
        className="relative inline-flex items-center gap-2 px-3 py-2 border border-[#00ff9c]/40 bg-black/80 hover:bg-[#00ff9c]/10 transition text-left"
      >
        <RainSplash splashes={6} drips={3} />
        <MapPin className="w-3.5 h-3.5 text-[#ff00d4]" />
        <span className="text-[10px] tracking-[0.25em] uppercase text-white/50 font-mono">Location</span>
        <span className="text-xs text-white font-bold">{location.label}</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 left-0 w-80 border border-[#00ff9c]/40 bg-black/95 backdrop-blur-xl shadow-[0_0_30px_rgba(0,255,156,0.2)]">
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#00ff9c]/20">
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#00ff9c] font-mono">// SET_LOCATION</span>
            <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 space-y-3">
            <button
              onClick={handleGPS}
              disabled={gpsLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#00ff9c] text-black text-[10px] tracking-[0.3em] uppercase font-bold hover:bg-white transition disabled:opacity-60"
            >
              {gpsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crosshair className="w-3.5 h-3.5" />}
              Use My GPS
            </button>

            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="City, ZIP, or address"
                className="flex-1 bg-black border border-white/15 px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-[#00ff9c] outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-3 border border-[#ff00d4]/50 text-[#ff00d4] hover:bg-[#ff00d4]/10 disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              </button>
            </form>

            {error && (
              <div className="text-[10px] text-[#ff00d4] tracking-wider">{error}</div>
            )}

            {results.length > 0 && (
              <div className="max-h-60 overflow-y-auto border border-white/10">
                {results.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => pick(r)}
                    className="w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-[#00ff9c]/10 hover:text-[#00ff9c] border-b border-white/5 last:border-0"
                  >
                    <div className="font-bold">{r.label}</div>
                    <div className="text-[10px] text-white/40 font-mono">
                      {r.lat?.toFixed(3)}, {r.lon?.toFixed(3)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}