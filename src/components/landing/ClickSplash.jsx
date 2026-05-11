import React, { useEffect } from 'react';

// Global click ripple — attaches one listener and spawns a splash ripple
// at the click point on any <button> or <a> element.
export default function ClickSplash() {
  useEffect(() => {
    const onClick = (e) => {
      const target = e.target.closest('button, a');
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      // Ensure ripple is positioned relative to the target
      const prevPos = target.style.position;
      const prevOverflow = target.style.overflow;
      const computed = window.getComputedStyle(target);
      if (computed.position === 'static') target.style.position = 'relative';
      target.style.overflow = 'hidden';

      const ripple = document.createElement('span');
      ripple.className = 'younk-splash-ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      target.appendChild(ripple);

      ripple.addEventListener(
        'animationend',
        () => {
          ripple.remove();
          // Restore original styles only after the last ripple is gone
          if (!target.querySelector('.younk-splash-ripple')) {
            target.style.position = prevPos;
            target.style.overflow = prevOverflow;
          }
        },
        { once: true }
      );
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <style>{`
      .younk-splash-ripple {
        position: absolute;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(0,255,156,0.55) 0%, rgba(255,0,212,0.35) 40%, rgba(0,255,156,0) 70%);
        transform: scale(0);
        opacity: 0.9;
        pointer-events: none;
        mix-blend-mode: screen;
        animation: younk-splash 650ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        z-index: 999;
      }
      @keyframes younk-splash {
        0%   { transform: scale(0);   opacity: 0.9; }
        60%  { opacity: 0.6; }
        100% { transform: scale(1.2); opacity: 0; }
      }
    `}</style>
  );
}