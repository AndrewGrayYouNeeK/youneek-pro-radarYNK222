import React from 'react';
import { Radar } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="relative bg-black border-t border-[#00ff9c]/20 py-10 px-5 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Radar className="w-4 h-4 text-[#00ff9c]" />
          <span className="text-[11px] tracking-[0.3em] uppercase text-white/60">
            YouNeeK Pro<span className="text-[#00ff9c]">_</span>Radar
          </span>
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