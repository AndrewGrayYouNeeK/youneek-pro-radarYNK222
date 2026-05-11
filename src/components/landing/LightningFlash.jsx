import React, { useEffect } from 'react';

export default function LightningFlash() {
  // Sync hard vibration with the CSS lightning animation (8s loop, flash at 93%/95%)
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.vibrate) return;

    const fireBolt = () => {
      // Big main bolt — heavy hit + rumble + secondary crack
      navigator.vibrate([400, 60, 200, 40, 120, 30, 80]);
      // Echo for the smaller secondary flash (~160ms later in the keyframes)
      setTimeout(() => navigator.vibrate([180, 40, 90]), 160);
    };

    // Fire once near start, then every 8s to match the @keyframes loop
    const initial = setTimeout(fireBolt, 7400); // 93% of 8000ms ≈ 7440ms
    const interval = setInterval(fireBolt, 8000);

    return () => {
      clearTimeout(initial);
      clearInterval(interval);
      navigator.vibrate(0);
    };
  }, []);

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