import React from 'react';

const LOGO_URL = 'https://media.base44.com/images/public/6a004a8189e15cd0ff5bc2f0/dfb81f42e_pgaLRg9bNEKoOW5HLzS34_rPjz7OY2.png';

export default function LandingFooter() {
  return (
    <footer className="relative bg-black border-t border-[#00ff9c]/20 py-10 px-5 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="YouNeeK Pro Radar" className="h-8 w-auto object-contain" />
        </div>
        <div className="text-[10px] tracking-[0.25em] uppercase text-white/30 font-mono">
          // Powered by NEXRAD · NOAA · NWS · SPC
        </div>
        <div className="text-[10px] tracking-[0.25em] uppercase text-white/30">
          © 2026 — All systems nominal
        </div>
      </div>
    </footer>
  );
}