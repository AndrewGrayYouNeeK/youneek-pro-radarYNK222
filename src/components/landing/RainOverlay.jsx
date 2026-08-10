import React, { useMemo } from 'react';

export default function RainOverlay() {
  const drops = useMemo(
    () =>
      Array.from({ length: 260 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 0.35 + Math.random() * 0.5,
        opacity: 0.35 + Math.random() * 0.55,
        height: 60 + Math.random() * 120,
        width: 1 + Math.random() * 1.5,
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[60]">
      {drops.map((d) => (
        <span
          key={d.id}
          className="absolute top-0 bg-gradient-to-b from-transparent via-[#9effe0] to-transparent"
          style={{
            left: `${d.left}%`,
            height: `${d.height}px`,
            width: `${d.width}px`,
            opacity: d.opacity,
            animation: `rain-fall ${d.duration}s linear ${d.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes rain-fall {
          0% { transform: translateY(-20vh) translateX(0); }
          100% { transform: translateY(120vh) translateX(-40px); }
        }
      `}</style>
    </div>
  );
}