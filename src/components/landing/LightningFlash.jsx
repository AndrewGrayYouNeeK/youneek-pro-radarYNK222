import React from 'react';

export default function LightningFlash() {
  return (
    <div className="fixed inset-0 bg-white opacity-0 pointer-events-none z-[65] animate-[lightning_8s_ease-in-out_infinite]">
      <style>{`
        @keyframes lightning {
          0%, 92%, 96%, 100% { opacity: 0; }
          93% { opacity: 0.4; }
          94% { opacity: 0; }
          95% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}