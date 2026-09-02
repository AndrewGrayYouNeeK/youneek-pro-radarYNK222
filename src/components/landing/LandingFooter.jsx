import React from 'react';
import { Link } from 'react-router-dom';
import { Radar } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer id="about" className="relative bg-black border-t border-[#00ff9c]/20 py-10 px-5 md:px-8 scroll-mt-32">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Radar className="w-4 h-4 text-[#00ff9c]" />
          <span className="text-[11px] tracking-[0.3em] uppercase text-white/60">
            YouNeeK Pro<span className="text-[#00ff9c]">_</span>Radar
          </span>
        </div>
        <div className="text-[10px] tracking-[0.25em] uppercase text-[#00ff9c] font-mono font-bold">
          // MAKING IT RAIN
        </div>
        <div className="flex items-center gap-4 text-[10px] tracking-[0.25em] uppercase text-white/40">
          <Link to="/Settings" className="hover:text-[#00ff9c]">Settings</Link>
          <Link to="/Forecast" className="hover:text-[#00ff9c]">Forecast</Link>
          <span>© 2026 — All systems nominal</span>
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-white/5 text-center">
        <div className="text-[10px] tracking-[0.4em] uppercase font-mono text-white/50">
          By <span className="text-[#00ff9c]">Andrew Gray</span>
        </div>
      </div>
    </footer>
  );
}