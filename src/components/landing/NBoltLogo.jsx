import React from 'react';

// "N" stylized as a lightning bolt — matches the neon brand logos
export default function NBoltLogo({ className = 'w-6 h-6', glow = true }) {
  return (
    <svg
      viewBox="0 0 32 40"
      className={className}
      fill="none"
      style={glow ? { filter: 'drop-shadow(0 0 4px #fff) drop-shadow(0 0 10px #00ff9c)' } : undefined}
    >
      {/* N-shaped lightning bolt: left vertical stroke, jagged diagonal, right vertical stroke */}
      <polygon
        points="2,2 10,2 10,18 18,12 18,38 26,38 26,22 18,28 18,2 26,2 26,22 18,28 10,18 10,38 2,38"
        fill="white"
        stroke="#00ff9c"
        strokeWidth="1.2"
        strokeLinejoin="miter"
      />
    </svg>
  );
}