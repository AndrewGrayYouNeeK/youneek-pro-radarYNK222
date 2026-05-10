import React from 'react';

// "N" where the diagonal middle stroke is a jagged lightning bolt
// that extends above the top-left and below the bottom-right of the letter.
export default function NBoltLogo({ className = 'w-8 h-10' }) {
  return (
    <svg
      viewBox="0 0 60 80"
      className={className}
      fill="none"
      style={{ filter: 'drop-shadow(0 0 4px #fff) drop-shadow(0 0 10px #00ff9c)', overflow: 'visible' }}
    >
      {/* Left vertical stroke of N */}
      <rect x="6" y="14" width="9" height="52" fill="white" />
      {/* Right vertical stroke of N */}
      <rect x="45" y="14" width="9" height="52" fill="white" />

      {/* Lightning bolt diagonal — extends past the N top-left and bottom-right */}
      <polygon
        points="20,0 38,28 28,32 44,80 22,46 32,42 14,14"
        fill="white"
        stroke="#00ff9c"
        strokeWidth="1.5"
        strokeLinejoin="miter"
      />
    </svg>
  );
}