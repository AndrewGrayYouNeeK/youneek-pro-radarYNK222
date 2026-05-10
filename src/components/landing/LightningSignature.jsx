import React from 'react';

export default function LightningSignature() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[70] flex items-center justify-center">
      <span
        className="text-[14px] md:text-2xl tracking-[0.5em] uppercase font-mono select-none animate-[signature_8s_ease-in-out_infinite]"
        style={{ color: 'rgba(255,255,255,0)', textShadow: '0 0 16px rgba(255,255,255,0.95)' }}
      >
        by Andrew Gray
      </span>
      <style>{`
        @keyframes signature {
          0%, 92%, 96%, 100% { color: rgba(255,255,255,0); }
          93% { color: rgba(255,255,255,0.9); }
          94% { color: rgba(255,255,255,0); }
          95% { color: rgba(255,255,255,0.55); }
        }
      `}</style>
    </div>
  );
}