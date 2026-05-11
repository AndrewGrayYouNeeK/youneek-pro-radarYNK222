import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Wind, Droplets, Gauge, Thermometer, MapPin, Loader2, Cloud } from 'lucide-react';
import { useLocation } from './LocationContext';

// helpers
const cToF = (c) => (c == null ? null : Math.round((c * 9) / 5 + 32));
const mpsToMph = (m) => (m == null ? null : Math.round(m * 2.23694));
const paToInHg = (p) => (p == null ? null : (p * 0.0002953).toFixed(2));

export default function CurrentConditions() {
  const { location, hydrated } = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('nwsData', { action: 'point', lat, lon });
      setData(res.data);
    } catch (e) {
      setError(e.message || 'Failed to load NOAA data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hydrated) return;
    load(location.lat, location.lon);
    // eslint-disable-next-line
  }, [hydrated, location.lat, location.lon]);

  const obs = data?.observation;
  const loc = data?.location;
  const fc = data?.forecast || [];

  return (
    <section id="conditions" className="relative bg-transparent py-24 px-5 md:px-8 overflow-hidden border-t border-[#00ff9c]/20">
      <div className="absolute inset-0 [background:radial-gradient(ellipse_at_bottom,rgba(0,255,156,0.08),transparent_60%)]" />
      <div className="relative max-w-7xl mx-auto">
        <div className="mb-10">
          <div className="text-[10px] tracking-[0.4em] uppercase text-[#00ff9c] mb-3 font-mono">
            // NOAA_OBSERVATIONS
          </div>
          <h2 className="text-4xl md:text-5xl font-bold leading-[0.95] tracking-tight text-white">
            Current <span className="text-[#00ff9c]">Conditions</span>
          </h2>
          <div className="mt-3 flex items-center gap-2 text-sm text-white/60">
            <MapPin className="w-3.5 h-3.5 text-[#ff00d4]" />
            <span>
              {loc ? `${loc.city || ''}${loc.city ? ', ' : ''}${loc.state || ''}` : location.label}
              {loc?.radarStation && (
                <span className="ml-3 text-[10px] tracking-[0.25em] uppercase text-[#00ff9c] font-mono">
                  RADAR: {loc.radarStation}
                </span>
              )}
            </span>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12 text-[#00ff9c]/70 text-xs tracking-[0.25em] uppercase">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Querying NOAA…
          </div>
        )}

        {error && (
          <div className="border border-[#ff00d4]/40 bg-[#ff00d4]/5 p-4 text-sm text-[#ff00d4]">
            {error}
          </div>
        )}

        {!loading && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <Stat icon={Thermometer} label="Temperature" value={cToF(obs?.temperatureC) ?? '—'} unit="°F" accent="#00ff9c" />
              <Stat icon={Wind} label="Wind" value={mpsToMph(obs?.windMps) ?? '—'} unit="MPH" accent="#ff00d4" />
              <Stat icon={Droplets} label="Humidity" value={obs?.humidity != null ? Math.round(obs.humidity) : '—'} unit="%" accent="#ffea00" />
              <Stat icon={Gauge} label="Pressure" value={paToInHg(obs?.pressurePa) ?? '—'} unit="inHg" accent="#00ff9c" />
            </div>

            {obs?.description && (
              <div className="mb-8 inline-flex items-center gap-3 px-4 py-3 border border-[#00ff9c]/30 bg-black/60">
                <Cloud className="w-4 h-4 text-[#00ff9c]" />
                <span className="text-sm text-white">{obs.description}</span>
                <span className="text-[10px] text-white/40 font-mono ml-2">
                  STN {obs.station}
                </span>
              </div>
            )}

            {fc.length > 0 && (
              <>
                <div className="text-[10px] tracking-[0.4em] uppercase text-[#ff00d4] mb-4 font-mono">
                  // 7_PERIOD_FORECAST
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                  {fc.map((p, i) => (
                    <div key={i} className="relative border border-[#00ff9c]/20 bg-black/60 p-3 hover:border-[#00ff9c]/50 transition">
                      <div className="text-[9px] tracking-[0.2em] uppercase text-[#00ff9c] mb-2 truncate">{p.name}</div>
                      <div className="text-2xl font-bold text-white tabular-nums">
                        {p.temperature}<span className="text-xs text-white/50">°{p.temperatureUnit}</span>
                      </div>
                      <div className="text-[10px] text-white/60 mt-1 line-clamp-2 leading-snug">{p.shortForecast}</div>
                      <div className="text-[9px] text-white/40 mt-2 font-mono">{p.windSpeed} {p.windDirection}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function Stat({ icon: Icon, label, value, unit, accent }) {
  return (
    <div className="relative border border-white/10 bg-black/60 p-4">
      <span className="absolute top-0 left-0 w-2 h-2 border-t border-l" style={{ borderColor: accent }} />
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r" style={{ borderColor: accent }} />
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3 h-3" style={{ color: accent }} />
        <span className="text-[9px] tracking-[0.25em] uppercase text-white/50">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-white tabular-nums">{value}</span>
        <span className="text-[10px] text-white/50">{unit}</span>
      </div>
    </div>
  );
}