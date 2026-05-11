import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import NBoltLogo from './NBoltLogo';

const NAV = [
  { label: 'Radar', href: '#radar' },
  { label: 'Alerts', href: '#alerts' },
  { label: 'Stations', href: '#stations' },
  { label: 'SOS', href: '#sos' },
  { label: 'About', href: '#about' },
];

export default function TopBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-[70] backdrop-blur-xl bg-black/70 border-b border-[#00ff9c]/20">
      <div className="absolute inset-0 pointer-events-none opacity-30 [background:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,156,0.04)_2px,rgba(0,255,156,0.04)_3px)]" />
      <div className="relative max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-white blur-xl opacity-90 group-hover:opacity-100 transition animate-pulse" />
            <div className="absolute inset-0 bg-[#00ff9c] blur-md opacity-70" />
            <div className="relative w-9 h-9 rounded-sm border border-white/80 bg-black flex items-center justify-center overflow-visible">
              <NBoltLogo className="w-10 h-12" />
            </div>
          </div>
          <div className="leading-tight">
            <div className="text-[10px] tracking-[0.3em] text-[#ff00d4]/80 uppercase">YouNeeK</div>
            <div className="text-base font-bold tracking-wider text-white">
              PRO<span className="text-[#00ff9c]"> RADAR</span>
            </div>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="relative px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/70 hover:text-[#00ff9c] transition group"
            >
              <span className="relative z-10">{item.label}</span>
              <span className="absolute inset-x-3 bottom-1 h-px bg-[#00ff9c] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </a>
          ))}
          <a
            href="#launch"
            className="ml-4 relative px-5 py-2 text-xs uppercase tracking-[0.25em] font-bold text-black bg-[#00ff9c] hover:bg-white transition-colors"
          >
            <span className="absolute inset-0 bg-[#ff00d4] -translate-x-1 -translate-y-1 -z-10" />
            Launch
          </a>
        </nav>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-[#00ff9c] p-2 border border-[#00ff9c]/40"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-[#00ff9c]/20 bg-black/95 backdrop-blur-xl">
          <nav className="flex flex-col p-4 gap-2">
            {NAV.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-xs uppercase tracking-[0.25em] text-white/70 hover:text-[#00ff9c] border border-white/5 hover:border-[#00ff9c]/40 transition"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#launch"
              className="px-4 py-3 text-xs uppercase tracking-[0.25em] text-center font-bold text-black bg-[#00ff9c]"
            >
              Launch App
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}