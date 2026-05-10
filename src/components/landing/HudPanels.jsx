import React from 'react';
import { Wind, Droplets, Gauge, Zap, AlertTriangle, Activity } from 'lucide-react';

const Panel = ({ children, className = '' }) => (
  <div className={`relative bg-black/70 backdrop-blur-md border border-[#00ff9c]/30 p-3 ${className}`}>
    <span className="absolute -top-px -left-px w-3 h-3 border-t border-l border-[#00ff9c]" />
    <span className="absolute -top-px -right-px w-3 h-3 border-t border-r border-[#ff00d4]" />
    <span className="absolute -bottom-px -left-px w-3 h-3 border-b border-l border-[#ff00d4]" />
    <span className="absolute -bottom-px -right-px w-3 h-3 border-b border-r border-[#00ff9c]" />
    {children}
  </div>
);

export const StatPanel = ({ icon: Icon, label, value, unit, accent = '#00ff9c' }) => (
  <Panel>
    <div className="flex items-center gap-2 mb-1">
      <Icon className="w-3 h-3" style={{ color: accent }} />
      <span className="text-[9px] uppercase tracking-[0.25em] text-white/50">{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-bold text-white tabular-nums">{value}</span>
      <span className="text-[10px] text-white/50">{unit}</span>
    </div>
  </Panel>
);

export const AlertPanel = () => (
  <Panel className="border-[#ff00d4]/50">
    <div className="flex items-center gap-2 mb-2">
      <AlertTriangle className="w-3 h-3 text-[#ff00d4] animate-pulse" />
      <span className="text-[9px] uppercase tracking-[0.25em] text-[#ff00d4]">SEVERE_TRACKING</span>
      <span className="ml-auto text-[9px] text-[#00ff9c] tabular-nums">LIVE</span>
    </div>
    <div className="text-[11px] text-white/80 leading-relaxed">
      <span className="text-[#ff00d4]">[!]</span> Storm cell detected · 12mi NE
    </div>
    <div className="text-[10px] text-white/50 mt-1">DBZ peak: 62 · Movement: 28mph SSE</div>
    <div className="mt-2 flex gap-1">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="flex-1 h-1"
          style={{
            background: i < 14 ? '#ff00d4' : 'rgba(255,255,255,0.1)',
            boxShadow: i < 14 ? '0 0 4px #ff00d4' : 'none',
          }}
        />
      ))}
    </div>
  </Panel>
);

export const SystemPanel = () => (
  <Panel>
    <div className="flex items-center gap-2 mb-2">
      <Activity className="w-3 h-3 text-[#00ff9c]" />
      <span className="text-[9px] uppercase tracking-[0.25em] text-white/50">NEXRAD_FEED</span>
      <span className="ml-auto inline-flex items-center gap-1 text-[9px] text-[#00ff9c]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9c] animate-pulse" /> ONLINE
      </span>
    </div>
    <div className="space-y-1 font-mono text-[10px] text-white/60">
      <div>&gt; tile.0/n0q ........ <span className="text-[#00ff9c]">OK</span></div>
      <div>&gt; spc.day1 ........... <span className="text-[#00ff9c]">OK</span></div>
      <div>&gt; nws.alerts ......... <span className="text-[#00ff9c]">OK</span></div>
      <div>&gt; sweep.refresh ...... <span className="text-[#ffea00]">2.4s</span></div>
    </div>
  </Panel>
);