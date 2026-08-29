import React from 'react';

const LOGO_1 = '/neon/logo-1.png';
const LOGO_2 = '/neon/logo-2.png';

export default function NeonBrandShowcase() {
  return (
    <section className="relative bg-black py-24 px-5 md:px-8 overflow-hidden border-y border-[#00ff9c]/20">
      {/* Ambient glow */}
      <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,rgba(255,0,212,0.12),transparent_60%)]" />
      <div className="absolute inset-0 opacity-20 pointer-events-none [background:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,156,0.06)_2px,rgba(0,255,156,0.06)_3px)]" />

      <div className="relative max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-14">
          <div className="text-[10px] tracking-[0.4em] uppercase text-[#ff00d4] mb-4 font-mono">
            // NEON_SIGNAL
          </div>
          <h2 className="text-3xl md:text-5xl font-bold leading-[0.95] tracking-tight text-white">
            Lit up like a <span className="text-[#00ff9c]">storm cell</span>.
          </h2>
          <div className="mt-4 text-sm md:text-base tracking-[0.35em] uppercase text-[#ff00d4] font-bold">
            Making it rain
          </div>
        </div>

        {/* Logo grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
          {[LOGO_1, LOGO_2].map((src, i) => (
            <div
              key={i}
              className="group relative z-[70] border border-[#00ff9c]/30 bg-black overflow-hidden"
              style={{ isolation: 'isolate' }}
            >
              {/* Corners */}
              <span className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#00ff9c] z-20" />
              <span className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#ff00d4] z-20" />
              <span className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#ff00d4] z-20" />
              <span className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#00ff9c] z-20" />

              {/* Label */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 text-[9px] tracking-[0.3em] uppercase text-[#00ff9c]/70 font-mono">
                LOGO_0{i + 1}
              </div>

              {/* Glow halo */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#ff00d4]/10 via-transparent to-[#00ff9c]/10 group-hover:opacity-100 opacity-70 transition" />

              <img
                src={src}
                alt={`YouNeeK Pro Radar neon sign ${i + 1}`}
                className="relative w-full h-auto block transition-transform duration-700 group-hover:scale-[1.02] brightness-75"
              />

              {/* Scanlines on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition pointer-events-none [background:repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(0,255,156,0.15)_3px,rgba(0,255,156,0.15)_4px)]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}