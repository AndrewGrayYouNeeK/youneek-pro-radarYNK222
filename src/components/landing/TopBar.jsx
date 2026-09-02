import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import NBoltLogo from './NBoltLogo';

const NAV = [
  { label: 'Radar', href: '/app' },
  { label: 'Alerts', href: '/app#alerts' },
  { label: 'Stations', href: '/app#stations' },
  { label: 'SOS', href: '/app#sos' },
  { label: 'Radar', href: '/Radar' },
  { label: 'Forecast', href: '/Forecast' },
  { label: 'Globe', href: '/Globe' },
  { label: 'SOS', href: '/Contacts' },
  { label: 'About', href: '#about' },
];

export default function TopBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-black/70 border-b border-[#00ff9c]/20">
      <div className="absolute inset-0 pointer-events-none opacity-30 [background:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,156,0.04)_2px,rgba(0,255,156,0.04)_3px)]" />
      <div className="relative max-w-7xl mx-auto px-5 md:px-8 h-28 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-4 group">
          <div className="relative">
            <div className="absolute inset-0 bg-white blur-xl opacity-90 group-hover:opacity-100 transition animate-pulse" />
            <div className="absolute inset-0 bg-[#00ff9c] blur-md opacity-70" />
            <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-sm border border-white/80 bg-black flex items-center justify-center overflow-visible">
              <NBoltLogo className="w-16 h-20 md:w-[4.5rem] md:h-[5.5rem]" />
            </div>
          </div>
          <div className="leading-tight">
            <div className="text-xl md:text-2xl tracking-[0.22em] text-[#ff00d4]/80 uppercase font-bold">YouNeeK</div>
            <div className="text-2xl md:text-3xl font-bold tracking-wider text-white">
              PRO<span className="text-[#00ff9c]"> RADAR</span>
            </div>
            <div className="text-[10px] md:text-xs tracking-[0.32em] uppercase text-[#00ff9c] font-bold">
              Making it rain
            </div>
          </div>
        </Link>

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
          {NAV.map((item) =>
            item.href.startsWith("#") ? (
              <a
                key={item.label}
                href={item.href}
                className="relative px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/70 hover:text-[#00ff9c] transition group"
              >
                <span className="relative z-10">{item.label}</span>
                <span className="absolute inset-x-3 bottom-1 h-px bg-[#00ff9c] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </a>
            ) : (
              <Link
                key={item.label}
                to={item.href}
                className="relative px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/70 hover:text-[#00ff9c] transition group"
              >
                <span className="relative z-10">{item.label}</span>
                <span className="absolute inset-x-3 bottom-1 h-px bg-[#00ff9c] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
            )
          )}
          <Link
            to="/app"
            className="ml-4 relative px-5 py-2 text-xs uppercase tracking-[0.25em] font-bold text-black bg-[#00ff9c] hover:bg-white transition-colors"
          >
            <span className="absolute inset-0 bg-[#ff00d4] -translate-x-1 -translate-y-1 -z-10" />
            Launch
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden relative z-[260] text-[#00ff9c] p-2 border border-[#00ff9c]/40 bg-black"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu — fixed overlay above rain (z-60) and location bar (z-70) */}
      {open && (
        <>
          {/* Full-screen dark overlay */}
          <div
            onClick={() => setOpen(false)}
            className="md:hidden fixed inset-0 z-[240] bg-black/90 backdrop-blur-md"
          />
          {/* Slide-in panel from top-right */}
          <div className="md:hidden fixed top-28 right-0 z-[250] w-72 max-w-[85vw] max-h-[calc(100vh-7rem)] overflow-y-auto bg-black border-l border-b border-[#00ff9c]/30 shadow-[0_0_40px_rgba(0,255,156,0.2)] animate-[slideInRight_0.25s_ease-out]">
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
              {NAV.map((item) =>
                item.href.startsWith("#") ? (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 text-xs uppercase tracking-[0.25em] text-white/70 hover:text-[#00ff9c] border border-white/5 hover:border-[#00ff9c]/40 transition"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 text-xs uppercase tracking-[0.25em] text-white/70 hover:text-[#00ff9c] border border-white/5 hover:border-[#00ff9c]/40 transition"
                  >
                    {item.label}
                  </Link>
                )
              )}
              <Link
                to="/app"
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-xs uppercase tracking-[0.25em] text-center font-bold text-black bg-[#00ff9c] hover:bg-white transition"
              >
                Launch App
              </Link>
            </nav>
          </div>
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); opacity: 0; }
              to   { transform: translateX(0);     opacity: 1; }
            }
          `}</style>
        </>
      )}
    </header>
  );
}