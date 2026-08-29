import React, { useEffect, useState } from 'react';
import { AlertOctagon, Tornado } from 'lucide-react';
import useTornadoNearby from './useTornadoNearby';

// Keep showing the banner this long AFTER the warning expires
const POST_WARNING_GRACE_MS = 3 * 60 * 60 * 1000; // 3 hours

export default function TornadoAlertBanner() {
  const { inWarning, warning } = useTornadoNearby();
  const [lingerUntil, setLingerUntil] = useState(0);
  const [now, setNow] = useState(Date.now());

  // When a warning becomes active, set the linger window to (expires + 3h)
  useEffect(() => {
    if (inWarning && warning) {
      const expires = warning?.properties?.expires
        ? new Date(warning.properties.expires).getTime()
        : Date.now();
      setLingerUntil(Math.max(lingerUntil, expires + POST_WARNING_GRACE_MS));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inWarning, warning?.id]);

  // Tick once a minute so the banner auto-hides when grace period ends
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  const stillLingering = !inWarning && now < lingerUntil;
  if (!inWarning && !stillLingering) return null;

  const area = warning?.properties?.areaDesc?.split(';')[0] || 'your area';
  const expires = warning?.properties?.expires
    ? new Date(warning.properties.expires)
    : null;

  return (
    <div
      className={`fixed top-24 left-0 right-0 z-40 border-b ${
        inWarning
          ? 'bg-[#ff0033] border-[#ff0033] animate-pulse'
          : 'bg-[#ff0033]/30 border-[#ff0033]/50 backdrop-blur-xl'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-2.5 flex items-center justify-center gap-3 text-center">
        {inWarning ? (
          <AlertOctagon className="w-4 h-4 text-white shrink-0" />
        ) : (
          <Tornado className="w-4 h-4 text-[#ff0033] shrink-0" />
        )}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
          <span
            className={`text-[11px] tracking-[0.3em] uppercase font-bold font-mono ${
              inWarning ? 'text-white' : 'text-[#ff0033]'
            }`}
          >
            {inWarning ? '⚠ TORNADO WARNING' : '// RECENT TORNADO WARNING'}
          </span>
          <span
            className={`text-xs font-mono ${
              inWarning ? 'text-white/90' : 'text-white/70'
            }`}
          >
            {area}
            {expires && (
              <span className="ml-2 opacity-70">
                · {inWarning ? 'Until' : 'Ended'} {expires.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </span>
        </div>
        <a
          href="#sos"
          className={`hidden sm:inline-flex items-center gap-1.5 ml-2 px-2.5 py-1 text-[10px] tracking-[0.25em] uppercase font-bold border transition ${
            inWarning
              ? 'bg-white text-[#ff0033] border-white hover:bg-black hover:text-white'
              : 'bg-black/50 text-[#ff0033] border-[#ff0033]/60 hover:bg-[#ff0033] hover:text-white'
          }`}
        >
          SOS
        </a>
      </div>
    </div>
  );
}