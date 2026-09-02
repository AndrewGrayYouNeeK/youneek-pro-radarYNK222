import React from 'react';
import { Link } from 'react-router-dom';
import { Radio, ShieldAlert, Tv, MapPin, Siren, CloudLightning } from 'lucide-react';

const FEATURES = [
  {
    icon: Tv,
    title: 'NEXRAD + 3D Globe',
    desc: 'Time-lapse loops, velocity, global radar, and a live 3D weather globe — all unlocked.',
    accent: '#00ff9c',
  },
  {
    icon: ShieldAlert,
    title: 'Severe Tracking',
    desc: 'NWS alerts, SPC outlooks, and storm cell intelligence pushed instantly.',
    accent: '#ff00d4',
  },
  {
    icon: Radio,
    title: 'NOAA Streams',
    desc: '15+ public weather radio feeds. Tune in from anywhere in CONUS.',
    accent: '#00ff9c',
  },
  {
    icon: Siren,
    title: 'Emergency SOS',
    desc: 'One-tap location share to trusted contacts during tornado warnings.',
    accent: '#ff00d4',
  },
  {
    icon: MapPin,
    title: 'Hyperlocal Data',
    desc: 'Wind, dew point, pressure, UV, AQI — calibrated to your exact GPS.',
    accent: '#ffea00',
  },
  {
    icon: CloudLightning,
    title: 'Storm Cells',
    desc: 'DBZ-coded cells, lightning strikes, and movement vectors visualized.',
    accent: '#00ff9c',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative bg-black py-24 px-5 md:px-8 overflow-hidden">
      {/* Grid bg */}
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,255,156,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,156,0.15) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div className="absolute inset-0 [background:radial-gradient(ellipse_at_top,rgba(255,0,212,0.08),transparent_60%)]" />

      <div className="relative max-w-7xl mx-auto">
        {/* Section header */}
        <div className="mb-16 max-w-2xl">
          <div className="text-[10px] tracking-[0.4em] uppercase text-[#ff00d4] mb-4 font-mono">
            // SYSTEM_CAPABILITIES
          </div>
          <h2 className="text-4xl md:text-6xl font-bold leading-[0.95] tracking-tight text-white">
            Built for the <span className="text-[#00ff9c]">storm</span>.<br />
            Tuned for the <span className="text-[#ff00d4]">warning</span>.
          </h2>
        </div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#00ff9c]/20 border border-[#00ff9c]/20">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="relative group bg-black p-7 hover:bg-[#00ff9c]/5 transition-colors min-h-[200px]"
            >
              <div className="absolute top-3 right-3 text-[9px] tracking-[0.25em] text-white/30 font-mono">
                0{i + 1}
              </div>
              <f.icon
                className="w-7 h-7 mb-5 transition-transform group-hover:scale-110"
                style={{ color: f.accent, filter: `drop-shadow(0 0 8px ${f.accent})` }}
              />
              <h3 className="text-xl font-bold text-white mb-2 tracking-wide">
                {f.title}
              </h3>
              <p className="text-sm text-white/60 leading-relaxed">{f.desc}</p>
              <div
                className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-500"
                style={{ background: f.accent, boxShadow: `0 0 8px ${f.accent}` }}
              />
            </div>
          ))}
        </div>

        {/* CTA strip */}
        <div className="mt-20 relative border border-[#00ff9c]/30 bg-gradient-to-r from-black via-[#001a14] to-black p-10 md:p-14 overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none [background:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,156,0.1)_2px,rgba(0,255,156,0.1)_3px)]" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="text-[10px] tracking-[0.4em] uppercase text-[#00ff9c] mb-3 font-mono">
                // INITIATE_SCAN
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-white max-w-xl">
                <span className="text-[#00ff9c]">MAKING IT RAIN</span>
              </h3>
            </div>
            <Link
              to="/app"
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-[#00ff9c] text-black font-bold text-xs tracking-[0.3em] uppercase whitespace-nowrap hover:bg-white transition-colors"
            >
              <span className="absolute inset-0 bg-[#ff00d4] -translate-x-1.5 -translate-y-1.5 -z-10 group-hover:-translate-x-2 group-hover:-translate-y-2 transition-transform" />
              Launch Pro Radar
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}