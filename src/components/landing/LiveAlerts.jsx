import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, ShieldAlert, Loader2, RefreshCw } from 'lucide-react';
import { useLocation } from './LocationContext';

const SEVERITY_COLOR = {
  Extreme: '#ff00d4',
  Severe: '#ff5e00',
  Moderate: '#ffea00',
  Minor: '#00ff9c',
  Unknown: '#9ca3af',
};

function formatTime(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return '—'; }
}

export default function LiveAlerts() {
  const { location } = useLocation();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updated, setUpdated] = useState(null);
  const [scope, setScope] = useState('local'); // 'local' | 'national'

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = { action: 'alerts', limit: 36 };
      if (scope === 'local' && location?.state) payload.area = location.state;
      const res = await base44.functions.invoke('nwsData', payload);
      setAlerts(res.data?.alerts || []);
      setUpdated(new Date());
    } catch (e) {
      setError(e.message || 'Failed to load NWS alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60000); // refresh every minute
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, [scope, location?.state]);

  return (
    <section id="alerts" className="relative bg-transparent py-24 px-5 md:px-8 overflow-hidden">
      <div className="absolute inset-0 [background:radial-gradient(ellipse_at_top_left,rgba(255,0,212,0.1),transparent_60%)]" />
      <div className="relative max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-[10px] tracking-[0.4em] uppercase text-[#ff00d4] mb-3 font-mono">
              // NWS_ACTIVE_ALERTS
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-[0.95] tracking-tight text-white">
              Active Severe <span className="text-[#ff00d4]">Alerts</span>
            </h2>
            <p className="mt-3 text-sm text-white/60 max-w-xl">
              Live feed from <span className="text-[#00ff9c]">api.weather.gov</span> —{' '}
              {scope === 'local' && location?.state
                ? <>showing alerts for <span className="text-[#ff00d4]">{location.state}</span></>
                : <>showing all active alerts across CONUS</>}.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start">
            <div className="flex border border-[#00ff9c]/30">
              <button
                onClick={() => setScope('local')}
                disabled={!location?.state}
                className={`px-3 py-2 text-[10px] tracking-[0.3em] uppercase transition ${
                  scope === 'local'
                    ? 'bg-[#00ff9c] text-black font-bold'
                    : 'text-white/60 hover:text-[#00ff9c] disabled:opacity-40'
                }`}
              >
                Local{location?.state ? ` (${location.state})` : ''}
              </button>
              <button
                onClick={() => setScope('national')}
                className={`px-3 py-2 text-[10px] tracking-[0.3em] uppercase transition border-l border-[#00ff9c]/30 ${
                  scope === 'national' ? 'bg-[#00ff9c] text-black font-bold' : 'text-white/60 hover:text-[#00ff9c]'
                }`}
              >
                National
              </button>
            </div>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 px-4 py-2 border border-[#00ff9c]/40 text-[#00ff9c] text-[10px] tracking-[0.3em] uppercase hover:bg-[#00ff9c]/10 transition"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {loading && alerts.length === 0 && (
          <div className="flex items-center justify-center py-20 text-[#00ff9c]/70 text-xs tracking-[0.25em] uppercase">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connecting to NWS…
          </div>
        )}

        {error && (
          <div className="border border-[#ff00d4]/40 bg-[#ff00d4]/5 p-4 text-sm text-[#ff00d4]">
            {error}
          </div>
        )}

        {!loading && alerts.length === 0 && !error && (
          <div className="border border-[#00ff9c]/30 bg-[#00ff9c]/5 p-8 text-center">
            <ShieldAlert className="w-6 h-6 text-[#00ff9c] mx-auto mb-3" />
            <div className="text-white text-sm">
              No active alerts {scope === 'local' && location?.state ? `for ${location.state}` : 'across CONUS'}.
            </div>
            <div className="text-white/40 text-xs mt-1">Skies are clear right now.</div>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {alerts.map((a) => {
            const color = SEVERITY_COLOR[a.severity] || SEVERITY_COLOR.Unknown;
            return (
              <div
                key={a.id}
                className="relative border border-white/10 bg-black/60 backdrop-blur p-4 hover:border-[#00ff9c]/40 transition"
                style={{ borderLeftColor: color, borderLeftWidth: 3 }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5" style={{ color }} />
                    <span className="text-[9px] tracking-[0.25em] uppercase" style={{ color }}>
                      {a.severity || 'Unknown'} · {a.urgency || '—'}
                    </span>
                  </div>
                  <span className="text-[9px] text-white/40 font-mono">
                    {formatTime(a.effective)}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white leading-snug mb-2">{a.event}</h3>
                <p className="text-[11px] text-white/60 leading-relaxed line-clamp-3">
                  {a.headline || a.areaDesc}
                </p>
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-white/40">
                  <span className="truncate pr-2">{a.areaDesc}</span>
                  <span className="text-[#00ff9c] whitespace-nowrap">exp {formatTime(a.expires)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {updated && (
          <div className="mt-6 text-[10px] tracking-[0.25em] uppercase text-white/30 font-mono text-right">
            Last sync: {updated.toLocaleTimeString()} · {alerts.length} active
          </div>
        )}
      </div>
    </section>
  );
}