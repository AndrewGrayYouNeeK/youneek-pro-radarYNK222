import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap } from 'lucide-react';
import TopBar from './TopBar';
import RadarSweep from './RadarSweep';
import { WindPanel, DbzPanel, AlertPanel, SystemPanel } from './HudPanels';
import LocationBar from './LocationBar';
import HeroWeather from './HeroWeather';
import TornadoAlertBanner from './TornadoAlertBanner';
import { useLocation } from './LocationContext';

export default function HeroSection() {
  const { location } = useLocation();
  const latLabel = location?.lat != null ? `LAT_${location.lat.toFixed(4)}°` : 'LAT_LOCKING…';
  const lonLabel = location?.lon != null ? `LON_${location.lon.toFixed(4)}°` : 'LON_LOCKING…';
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-black">
      <TopBar />
      <TornadoAlertBanner />

      {/* Color grade (no photo — storm overlays sit on black) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-[#0a0014]/70 to-black" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0014]/80 via-transparent to-[#001a14]/80" />
      <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-30 z-20 [background:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,156,0.06)_2px,rgba(0,255,156,0.06)_3px)]" />
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none opacity-30"
        style={{
          background:
            'linear-gradient(to bottom, transparent, rgba(0,255,156,0.05)), repeating-linear-gradient(90deg, rgba(0,255,156,0.3) 0 1px, transparent 1px 80px), repeating-linear-gradient(0deg, rgba(0,255,156,0.3) 0 1px, transparent 1px 60px)',
          transform: 'perspective(400px) rotateX(60deg)',
          transformOrigin: 'bottom',
        }}
      />

      {/* Lightning title overlay — does not reserve layout space */}
      <h1
        className="hero-title-strike pointer-events-none absolute inset-x-0 top-[38%] z-[66] px-5 text-center font-bold leading-[0.9] tracking-tight md:px-8"
        aria-hidden="true"
      >
        <span className="block text-[12vw] text-white drop-shadow-[0_0_30px_rgba(0,255,156,0.4)] md:text-[5.5rem] lg:text-[6.5rem]">
          YouNeeK
        </span>
        <span
          className="block text-[12vw] bg-clip-text text-transparent md:text-[5.5rem] lg:text-[6.5rem]"
          style={{
            backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #c0c0c0 50%, #707070 100%)',
            WebkitTextStroke: '1px rgba(0,255,156,0.3)',
          }}
        >
          PRO
        </span>
        <span className="relative mx-auto block text-[12vw] md:text-[5.5rem] lg:text-[6.5rem]">
          <span className="absolute inset-0 text-[#ff00d4] translate-x-[3px] translate-y-[1px] mix-blend-screen opacity-80 animate-[glitch_3s_infinite]">
            RADAR
          </span>
          <span className="absolute inset-0 text-[#00ff9c] -translate-x-[3px] -translate-y-[1px] mix-blend-screen opacity-80 animate-[glitch_3s_infinite_reverse]">
            RADAR
          </span>
          <span className="relative text-white">RADAR</span>
        </span>
      </h1>

      {/* Content — WeatherBug-style: location + now-card first, no empty title hole */}
      <div className="relative z-[40] mx-auto flex min-h-screen max-w-7xl flex-col px-5 pb-16 pt-32 md:px-8 md:pt-36">
        <div className="grid flex-1 items-start gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
          {/* LEFT — live weather desk */}
          <div className="relative flex max-w-xl flex-col">
            <div className="mb-3 inline-flex w-fit items-center gap-3 border border-[#00ff9c]/40 bg-black/80 px-3 py-1.5 backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#00ff9c] shadow-[0_0_8px_#00ff9c]" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#00ff9c]">SYS_ONLINE</span>
              <span className="text-[10px] text-white/40">|</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/60">NEXRAD_v2.4</span>
            </div>

            <div className="relative z-[70] mb-3" style={{ isolation: 'isolate' }}>
              <LocationBar />
            </div>

            <HeroWeather />

            <div className="mt-5 text-xl font-bold uppercase tracking-[0.28em] text-[#00ff9c] drop-shadow-[0_0_18px_rgba(0,255,156,0.55)] md:text-2xl">
              Making it rain
            </div>
            <p className="mt-3 max-w-md border-l-2 border-[#00ff9c]/40 pl-4 text-sm leading-relaxed text-white/70 md:text-base">
              Same live conditions on landing, Forecast, and radar — WeatherBug-class desk, unlocked.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/app"
                className="group relative inline-flex items-center gap-2 bg-[#00ff9c] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.25em] text-black transition-colors hover:bg-white"
              >
                <span className="absolute inset-0 -z-10 -translate-x-1.5 -translate-y-1.5 bg-[#ff00d4] transition-transform group-hover:-translate-x-2 group-hover:-translate-y-2" />
                Launch Radar
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                to="/Forecast"
                className="inline-flex items-center gap-2 border border-[#00ff9c]/40 px-5 py-3.5 text-xs uppercase tracking-[0.25em] text-[#00ff9c] transition hover:bg-[#00ff9c]/10"
              >
                Forecast
              </Link>
              <a
                href="#conditions"
                className="inline-flex items-center gap-2 border border-white/30 px-5 py-3.5 text-xs uppercase tracking-[0.25em] text-white/80 transition hover:border-[#00ff9c] hover:text-[#00ff9c]"
              >
                <Zap className="h-4 w-4" />
                Hourly &amp; 10-day
              </a>
            </div>

            <div className="mt-6 grid max-w-md grid-cols-3 gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">Forecast</div>
                <div className="text-2xl font-bold tabular-nums text-[#00ff9c]">16d</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">Hourly</div>
                <div className="text-2xl font-bold tabular-nums text-white">168h</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">Radar</div>
                <div className="text-2xl font-bold tabular-nums text-[#ff00d4]">LIVE</div>
              </div>
            </div>
          </div>

          {/* RIGHT — Radar HUD */}
          <div className="relative lg:justify-self-end">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              <RadarSweep />

              <div className="absolute -left-2 -top-4 hidden w-40 md:block md:-left-8">
                <WindPanel />
              </div>
              <div className="absolute -right-2 top-1/4 hidden w-44 md:block md:-right-8">
                <AlertPanel />
              </div>
              <div className="absolute -bottom-4 left-0 hidden w-44 md:block md:-left-12">
                <SystemPanel />
              </div>
              <div className="absolute -bottom-2 right-0 hidden w-40 md:block md:-right-6">
                <DbzPanel />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 md:hidden">
              <WindPanel />
              <DbzPanel />
              <div className="col-span-2">
                <AlertPanel />
              </div>
            </div>

            <div className="mt-8 hidden items-center justify-between font-mono text-[10px] tracking-[0.25em] text-white/40 md:flex">
              <span>{latLabel}</span>
              <span className="text-[#00ff9c]">// SCAN_ACTIVE //</span>
              <span>{lonLabel}</span>
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
        /* Locked to LightningFlash: 8s loop, bolts at 91% / 93% / 95% */
        .hero-title-strike {
          opacity: 0;
          mix-blend-mode: difference;
          animation: titleStrike 8s ease-in-out infinite;
        }
        @keyframes titleStrike {
          0%, 90%, 96%, 100% { opacity: 0; }
          91% { opacity: 1; }
          92% { opacity: 0.12; }
          93% { opacity: 1; }
          94% { opacity: 0; }
          95% { opacity: 0.65; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-title-strike {
            animation: none;
            opacity: 0.35;
            mix-blend-mode: normal;
          }
        }
      `}</style>
    </section>
  );
}
