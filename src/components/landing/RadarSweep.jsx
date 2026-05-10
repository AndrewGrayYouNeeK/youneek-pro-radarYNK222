import React from 'react';

export default function RadarSweep() {
  return (
    <div className="relative w-full aspect-square max-w-[520px] mx-auto">
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full bg-[#00ff9c]/10 blur-3xl animate-pulse" />

      {/* Concentric rings */}
      <div className="absolute inset-0 rounded-full border border-[#00ff9c]/40" />
      <div className="absolute inset-[8%] rounded-full border border-[#00ff9c]/30" />
      <div className="absolute inset-[20%] rounded-full border border-[#00ff9c]/25 border-dashed" />
      <div className="absolute inset-[34%] rounded-full border border-[#ff00d4]/30" />
      <div className="absolute inset-[48%] rounded-full border border-[#00ff9c]/25" />

      {/* Crosshair */}
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[#00ff9c]/20 -translate-x-1/2" />
      <div className="absolute left-0 right-0 top-1/2 h-px bg-[#00ff9c]/20 -translate-y-1/2" />

      {/* Sweep arm */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(0,255,156,0.0) 270deg, rgba(0,255,156,0.5) 350deg, rgba(0,255,156,0.95) 360deg)',
          animation: 'radar-spin 4s linear infinite',
          maskImage: 'radial-gradient(circle, black 50%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(circle, black 50%, transparent 100%)',
        }}
      />

      {/* Storm cells */}
      <div className="absolute top-[25%] left-[30%] w-12 h-12 rounded-full bg-[#ff00d4]/40 blur-md animate-pulse" />
      <div className="absolute top-[55%] left-[60%] w-16 h-16 rounded-full bg-[#ff00d4]/50 blur-lg animate-pulse" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-[40%] left-[20%] w-8 h-8 rounded-full bg-[#ffea00]/60 blur-sm animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[65%] left-[35%] w-10 h-10 rounded-full bg-[#00ff9c]/60 blur-md animate-pulse" style={{ animationDelay: '1.5s' }} />

      {/* Center dot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#00ff9c] shadow-[0_0_20px_#00ff9c]" />

      {/* Coordinate labels */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] text-[#00ff9c]/60">N</div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] text-[#00ff9c]/60">S</div>
      <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] tracking-[0.3em] text-[#00ff9c]/60">W</div>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] tracking-[0.3em] text-[#00ff9c]/60">E</div>

      <style>{`
        @keyframes radar-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}