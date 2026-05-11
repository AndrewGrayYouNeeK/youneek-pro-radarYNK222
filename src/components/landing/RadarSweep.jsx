import React from 'react';
import useLiveStormData from './useLiveStormData';

// Plot real storm cells onto the radar sweep, positioned by bearing/distance
// from the user's selected location. Radius scales with dBZ intensity, color
// reflects severity (green → yellow → magenta → red for TVS/meso).
export default function RadarSweep() {
  const { cells } = useLiveStormData();

  // Max display radius = 150 mi (matches backend cell filter)
  const MAX_MI = 150;

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

      {/* Real storm cells */}
      {cells.map((c, i) => {
        // Bearing 0 = North = up. Convert to x/y offset from center.
        const r = Math.min(c.distanceMi / MAX_MI, 1) * 0.48; // 0..0.48 of the radius
        const angleRad = (c.bearing - 90) * (Math.PI / 180); // rotate so 0° points up
        const x = 50 + r * 100 * Math.cos(angleRad);
        const y = 50 + r * 100 * Math.sin(angleRad);

        const dbz = c.dbz || 0;
        const size = 14 + Math.min(40, dbz * 0.6); // visual size scales with intensity
        const severe = c.tvs || c.meso;
        const color = severe
          ? '#ff0033'
          : dbz >= 55
            ? '#ff00d4'
            : dbz >= 40
              ? '#ffea00'
              : '#00ff9c';

        return (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none animate-pulse"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${size}px`,
              height: `${size}px`,
              background: color,
              opacity: 0.55,
              filter: 'blur(6px)',
              transform: 'translate(-50%, -50%)',
              animationDelay: `${i * 0.2}s`,
              boxShadow: severe ? `0 0 20px ${color}` : 'none',
            }}
          />
        );
      })}

      {/* Center dot — user's location */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#00ff9c] shadow-[0_0_20px_#00ff9c]" />

      {/* Coordinate labels */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] text-[#00ff9c]/60">N</div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] text-[#00ff9c]/60">S</div>
      <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] tracking-[0.3em] text-[#00ff9c]/60">W</div>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] tracking-[0.3em] text-[#00ff9c]/60">E</div>

      {/* Cell count badge */}
      {cells.length > 0 && (
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 border border-[#ff00d4]/50 text-[9px] tracking-[0.25em] uppercase text-[#ff00d4] font-mono">
          {cells.length} CELLS · 150MI
        </div>
      )}

      <style>{`
        @keyframes radar-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}