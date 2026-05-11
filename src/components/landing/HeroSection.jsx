import React from 'react';
import { ChevronRight, Zap } from 'lucide-react';
import TopBar from './TopBar';
import RadarSweep from './RadarSweep';
import { StatPanel, AlertPanel, SystemPanel } from './HudPanels';
import { Wind, Droplets, Gauge, Thermometer } from 'lucide-react';
import LocationBar from './LocationBar';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-black">
      <TopBar />

      {/* Background City */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://media.base44.com/images/public/6a004a8189e15cd0ff5bc2f0/7b9a7e505_generated_67357671.png')`,
        }}
      />
      {/* Color grade */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-[#0a0014]/70 to-black" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0014]/80 via-transparent to-[#001a14]/80" />

      {/* Vignette */}
      <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)]" />



      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-30 z-20 [background:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,156,0.06)_2px,rgba(0,255,156,0.06)_3px)]" />

      {/* Grid Floor */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none opacity-30"
        style={{
          background:
            'linear-gradient(to bottom, transparent, rgba(0,255,156,0.05)), repeating-linear-gradient(90deg, rgba(0,255,156,0.3) 0 1px, transparent 1px 80px), repeating-linear-gradient(0deg, rgba(0,255,156,0.3) 0 1px, transparent 1px 60px)',
          transform: 'perspective(400px) rotateX(60deg)',
          transformOrigin: 'bottom',
        }}
      />

      {/* Content */}
      <div className="relative z-30 max-w-7xl mx-auto px-5 md:px-8 pt-32 pb-20 min-h-screen flex flex-col">
        <div className="grid lg:grid-cols-2 gap-10 items-center flex-1">
          {/* LEFT — Copy */}
          <div className="relative">
            {/* Location selector — centered above SYS_ONLINE */}
            <div className="flex justify-center mb-4">
              <LocationBar />
            </div>

            {/* Status Bar */}
            <div className="inline-flex items-center gap-3 px-3 py-1.5 border border-[#00ff9c]/40 bg-black/50 backdrop-blur mb-8">
              <span className="w-2 h-2 rounded-full bg-[#00ff9c] animate-pulse shadow-[0_0_8px_#00ff9c]" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#00ff9c]">SYS_ONLINE</span>
              <span className="text-white/40 text-[10px]">|</span>
              <span className="text-[10px] tracking-[0.3em] uppercase text-white/60">NEXRAD_v2.4</span>
            </div>

            {/* Title with glitch */}
            <h1 className="relative font-bold leading-[0.9] tracking-tight">
              <span className="block text-[11vw] md:text-[5rem] lg:text-[6rem] text-white drop-shadow-[0_0_30px_rgba(0,255,156,0.4)]">
                YouNeeK
              </span>
              <span
                className="block text-[11vw] md:text-[5rem] lg:text-[6rem] bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #c0c0c0 50%, #707070 100%)',
                  WebkitTextStroke: '1px rgba(0,255,156,0.3)',
                }}
              >
                PRO
              </span>
              <span className="relative block text-[11vw] md:text-[5rem] lg:text-[6rem]">
                <span className="absolute inset-0 text-[#ff00d4] translate-x-[3px] translate-y-[1px] mix-blend-screen opacity-80 animate-[glitch_3s_infinite]">
                  RADAR
                </span>
                <span className="absolute inset-0 text-[#00ff9c] -translate-x-[3px] -translate-y-[1px] mix-blend-screen opacity-80 animate-[glitch_3s_infinite_reverse]">
                  RADAR
                </span>
                <span className="relative text-white">RADAR</span>
              </span>
            </h1>

            <p className="mt-8 max-w-md text-sm md:text-base text-white/70 leading-relaxed border-l-2 border-[#00ff9c]/40 pl-4">
              Real-time storm tracking with time-lapse loops, multi-layer radar,
              and hurricane overlays. Severe weather monitoring that doesn't blink.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#launch"
                className="group relative inline-flex items-center gap-2 px-6 py-3.5 bg-[#00ff9c] text-black font-bold text-xs tracking-[0.25em] uppercase hover:bg-white transition-colors"
              >
                <span className="absolute inset-0 bg-[#ff00d4] -translate-x-1.5 -translate-y-1.5 -z-10 group-hover:-translate-x-2 group-hover:-translate-y-2 transition-transform" />
                Launch Radar
                <ChevronRight className="w-4 h-4" />
              </a>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-white/30 text-white/80 text-xs tracking-[0.25em] uppercase hover:border-[#00ff9c] hover:text-[#00ff9c] transition"
              >
                <Zap className="w-4 h-4" />
                See Features
              </a>
            </div>

            {/* Mini stats */}
            <div className="mt-10 grid grid-cols-3 gap-3 max-w-md">
              <div>
                <div className="text-[10px] tracking-[0.2em] uppercase text-white/40">Stations</div>
                <div className="text-2xl font-bold text-[#00ff9c] tabular-nums">15+</div>
              </div>
              <div>
                <div className="text-[10px] tracking-[0.2em] uppercase text-white/40">Refresh</div>
                <div className="text-2xl font-bold text-white tabular-nums">2.4s</div>
              </div>
              <div>
                <div className="text-[10px] tracking-[0.2em] uppercase text-white/40">Coverage</div>
                <div className="text-2xl font-bold text-[#ff00d4] tabular-nums">CONUS</div>
              </div>
            </div>
          </div>

          {/* RIGHT — Radar HUD */}
          <div className="relative">
            <div className="relative">
              <RadarSweep />

              {/* Floating HUD panels */}
              <div className="absolute -top-4 -left-2 md:-left-8 w-40 hidden md:block">
                <StatPanel icon={Wind} label="Wind" value="28" unit="MPH" accent="#00ff9c" />
              </div>
              <div className="absolute top-1/4 -right-2 md:-right-8 w-44 hidden md:block">
                <AlertPanel />
              </div>
              <div className="absolute -bottom-4 left-0 md:-left-12 w-44 hidden md:block">
                <SystemPanel />
              </div>
              <div className="absolute -bottom-2 right-0 md:-right-6 w-40 hidden md:block">
                <StatPanel icon={Thermometer} label="DBZ_PEAK" value="62" unit="DBZ" accent="#ff00d4" />
              </div>
            </div>

            {/* Mobile HUD row */}
            <div className="grid grid-cols-2 gap-3 mt-6 md:hidden">
              <StatPanel icon={Wind} label="Wind" value="28" unit="MPH" />
              <StatPanel icon={Thermometer} label="DBZ" value="62" unit="DBZ" accent="#ff00d4" />
              <div className="col-span-2"><AlertPanel /></div>
            </div>

            {/* Coordinates ticker */}
            <div className="mt-8 hidden md:flex items-center justify-between text-[10px] tracking-[0.25em] text-white/40 font-mono">
              <span>LAT_37.1031°</span>
              <span className="text-[#00ff9c]">// SCAN_ACTIVE //</span>
              <span>LON_-85.3047°</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes glitch {
          0%, 90%, 100% { transform: translate(0, 0); }
          92% { transform: translate(2px, -1px); }
          94% { transform: translate(-2px, 1px); }
          96% { transform: translate(1px, 2px); }
        }
        @keyframes lightning {
          0%, 92%, 96%, 100% { opacity: 0; }
          93% { opacity: 0.4; }
          94% { opacity: 0; }
          95% { opacity: 0.2; }
        }
        @keyframes signature {
          0%, 92%, 96%, 100% { color: rgba(255,255,255,0); }
          93% { color: rgba(255,255,255,0.85); }
          94% { color: rgba(255,255,255,0); }
          95% { color: rgba(255,255,255,0.5); }
        }
      `}</style>
    </section>
  );
}