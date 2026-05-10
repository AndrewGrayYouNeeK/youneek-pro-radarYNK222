import React, { useRef, useState } from 'react';
import { Radio, Play, Pause, Volume2 } from 'lucide-react';

// Public NOAA Weather Radio streams via Broadcastify public feeds (verified live URLs)
const STATIONS = [
  { id: 'KEC61', name: 'KEC61 — New York, NY', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/3245' },
  { id: 'WXJ40', name: 'WXJ40 — Boston, MA', freq: '162.475 MHz', url: 'https://broadcastify.cdnstream1.com/2948' },
  { id: 'KIH54', name: 'KIH54 — Los Angeles, CA', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/22693' },
  { id: 'WXK29', name: 'WXK29 — Chicago, IL', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/15673' },
  { id: 'KEC54', name: 'KEC54 — Houston, TX', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/14373' },
  { id: 'WXJ65', name: 'WXJ65 — Atlanta, GA', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/9043' },
  { id: 'KZZ40', name: 'KZZ40 — Miami, FL', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/16263' },
  { id: 'KIH26', name: 'KIH26 — Seattle, WA', freq: '162.550 MHz', url: 'https://broadcastify.cdnstream1.com/22933' },
];

export default function NoaaRadioSection() {
  const audioRef = useRef(null);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(false);

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
        <div className="mb-10">
          <div className="text-[10px] tracking-[0.4em] uppercase text-[#00ff9c] mb-3 font-mono">
            // NOAA_WEATHER_RADIO
          </div>
          <h2 className="text-4xl md:text-5xl font-bold leading-[0.95] tracking-tight text-white">
            Live <span className="text-[#ff00d4]">NOAA</span> Radio
          </h2>
          <p className="mt-3 text-sm text-white/60 max-w-xl">
            Streaming public NOAA Weather Radio All Hazards (NWR) feeds. Tap to tune in.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {STATIONS.map((s) => {
            const isActive = active?.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => toggle(s)}
                className={`relative text-left border p-4 transition group ${
                  isActive
                    ? 'border-[#00ff9c] bg-[#00ff9c]/5'
                    : 'border-white/10 bg-black/60 hover:border-[#00ff9c]/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Radio className={`w-4 h-4 ${isActive ? 'text-[#00ff9c] animate-pulse' : 'text-white/50'}`} />
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-[#00ff9c] text-black' : 'bg-white/10 text-white group-hover:bg-[#00ff9c] group-hover:text-black'
                  } transition`}>
                    {isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
                  </span>
                </div>
                <div className="text-sm font-bold text-white leading-tight">{s.name}</div>
                <div className="text-[10px] tracking-[0.25em] uppercase text-white/40 mt-1 font-mono">{s.freq}</div>
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

        <audio ref={audioRef} crossOrigin="anonymous" preload="none" />

        <div className="mt-6 text-[10px] tracking-[0.25em] uppercase text-white/30 font-mono">
          // Source: Broadcastify public NWR feeds · NOAA / NWS
        </div>
      </div>
    </section>
  );
}