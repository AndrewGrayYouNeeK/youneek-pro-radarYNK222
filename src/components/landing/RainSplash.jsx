import React, { useMemo } from 'react';

/**
 * Decorative rain-impact overlay: tiny splashes burst along the top edge
 * and water drips slide down the left & right sides of a parent box.
 * Parent must be position: relative (or this will absolute-fill its container).
 */
export default function RainSplash({ splashes = 7, drips = 4 }) {
  const splashList = useMemo(
    () =>
      Array.from({ length: splashes }).map(() => ({
        left: Math.random() * 100,
        delay: Math.random() * 2.5,
        duration: 0.9 + Math.random() * 0.6,
        scale: 0.7 + Math.random() * 0.7,
      })),
    [splashes]
  );

  const dripList = useMemo(
    () =>
      Array.from({ length: drips }).map(() => ({
        side: Math.random() > 0.5 ? 'left' : 'right',
        top: Math.random() * 60,
        delay: Math.random() * 3,
        duration: 1.6 + Math.random() * 1.4,
        height: 14 + Math.random() * 22,
      })),
    [drips]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible z-[1]">
      {/* Top splashes */}
      {splashList.map((s, i) => (
        <span
          key={`s-${i}`}
          className="absolute -top-1"
          style={{
            left: `${s.left}%`,
            animation: `rainSplash ${s.duration}s ease-out ${s.delay}s infinite`,
            transform: `scale(${s.scale})`,
          }}
        >
          <span className="block w-2 h-2 rounded-full border border-white/70" />
        </span>
      ))}

      {/* Side drips */}
      {dripList.map((d, i) => (
        <span
          key={`d-${i}`}
          className="absolute"
          style={{
            [d.side]: '-1px',
            top: `${d.top}%`,
            width: '2px',
            height: `${d.height}px`,
            background:
              'linear-gradient(to bottom, rgba(180,220,255,0.85), rgba(180,220,255,0))',
            animation: `rainDrip ${d.duration}s ease-in ${d.delay}s infinite`,
            opacity: 0,
          }}
        />
      ))}

      <style>{`
        @keyframes rainSplash {
          0%   { transform: scale(0.2); opacity: 0; }
          20%  { opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes rainDrip {
          0%   { transform: translateY(-4px); opacity: 0; }
          20%  { opacity: 1; }
          100% { transform: translateY(20px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}