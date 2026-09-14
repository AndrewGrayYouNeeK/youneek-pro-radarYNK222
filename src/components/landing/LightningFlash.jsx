import React, { useEffect } from 'react';

export default function LightningFlash() {
  // Sync vibration with ynk-lightning in index.css (6s loop, first bolt at 14%)
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.vibrate) return;

    const fireBolt = () => {
      // Big main bolt — heavy hit + rumble + secondary crack
      navigator.vibrate([400, 60, 200, 40, 120, 30, 80]);
      // Echo for the smaller secondary flash (~160ms later in the keyframes)
      setTimeout(() => navigator.vibrate([180, 40, 90]), 160);
    };

    // Fire with the CSS bolt (14% of 6s ≈ 840ms), then every 6s
    const initial = setTimeout(fireBolt, 840);
    const interval = setInterval(fireBolt, 6000);

    return () => {
      clearTimeout(initial);
      clearInterval(interval);
      navigator.vibrate(0);
    };
  }, []);

  return (
    <div
      className="ynk-lightning-overlay pointer-events-none fixed inset-0 z-[65] bg-white opacity-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}