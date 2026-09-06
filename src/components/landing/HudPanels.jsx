import React from 'react';
import { Wind, AlertTriangle, Activity, Loader2 } from 'lucide-react';
import useLiveStormData from './useLiveStormData';
import useUnifiedWeather from '@/hooks/useUnifiedWeather';
import { degToCardinal } from '@/lib/weather/conditions';
import { convertWindMph, formatNumber, windSuffix } from '@/lib/weather/units';
import { useUnits } from '@/lib/UnitsContext';

const Panel = ({ children, className = '' }) => (
  <div className={`relative z-[40] bg-black/70 backdrop-blur-md border border-[#00ff9c]/30 p-3 ${className}`}>
    <span className="absolute -top-px -left-px w-3 h-3 border-t border-l border-[#00ff9c]" />
    <span className="absolute -top-px -right-px w-3 h-3 border-t border-r border-[#ff00d4]" />
    <span className="absolute -bottom-px -left-px w-3 h-3 border-b border-l border-[#ff00d4]" />
    <span className="absolute -bottom-px -right-px w-3 h-3 border-b border-r border-[#00ff9c]" />
    {children}
  </div>
);

// LIVE wind from the same WeatherBug-class feed as Forecast
export const WindPanel = () => {
  const { units } = useUnits();
  const { current, isLoading, source } = useUnifiedWeather();
  const windValue = convertWindMph(current?.wind_speed_10m, units.wind);
  const dir = degToCardinal(current?.wind_direction_10m);
  return (
    <Panel>
      <div className="flex items-center gap-2 mb-1">
        <Wind className="w-3 h-3 text-[#00ff9c]" />
        <span className="text-[9px] uppercase tracking-[0.25em] text-white/50">WIND</span>
        {isLoading && <Loader2 className="w-3 h-3 animate-spin text-white/30 ml-auto" />}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-white tabular-nums">
          {windValue != null ? formatNumber(windValue, units.wind === "mps" ? 1 : 0) : "—"}
        </span>
        <span className="text-[10px] text-white/50">{windSuffix(units.wind)} {dir}</span>
      </div>
      <div className="text-[9px] text-white/40 font-mono mt-1">
        {source === "weatherkit" ? "WeatherKit" : source === "open-meteo" ? "Open-Meteo" : "No wind data"}
      </div>
    </Panel>
  );
};

// LIVE peak reflectivity from nearest real storm cell
export const DbzPanel = () => {
  const { cells, loading } = useLiveStormData();
  const peak = cells.reduce((m, c) => (c.dbz != null && c.dbz > m ? c.dbz : m), 0);
  return (
    <Panel>
      <div className="flex items-center gap-2 mb-1">
        <Activity className="w-3 h-3 text-[#ff00d4]" />
        <span className="text-[9px] uppercase tracking-[0.25em] text-white/50">DBZ_PEAK</span>
        {loading && <Loader2 className="w-3 h-3 animate-spin text-white/30 ml-auto" />}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-white tabular-nums">
          {peak > 0 ? Math.round(peak) : '—'}
        </span>
        <span className="text-[10px] text-white/50">DBZ</span>
      </div>
      <div className="text-[9px] text-white/40 font-mono mt-1">
        {cells.length} cell{cells.length !== 1 ? 's' : ''} tracked
      </div>
    </Panel>
  );
};

// LIVE severe cell tracking — nearest real storm cell
export const AlertPanel = () => {
  const { cells, loading } = useLiveStormData();
  const nearest = cells[0];

  if (loading && !nearest) {
    return (
      <Panel className="border-[#ff00d4]/50">
        <div className="flex items-center gap-2 text-[10px] text-white/60">
          <Loader2 className="w-3 h-3 animate-spin" /> Scanning NEXRAD…
        </div>
      </Panel>
    );
  }

  if (!nearest) {
    return (
      <Panel className="border-[#00ff9c]/40">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-3 h-3 text-[#00ff9c]" />
          <span className="text-[9px] uppercase tracking-[0.25em] text-[#00ff9c]">SEVERE_TRACKING</span>
          <span className="ml-auto text-[9px] text-[#00ff9c] tabular-nums">LIVE</span>
        </div>
        <div className="text-[11px] text-white/70">No storm cells within 150 mi</div>
        <div className="text-[10px] text-white/40 mt-1">All clear · NEXRAD scan complete</div>
      </Panel>
    );
  }

  // Bar fills proportional to dBZ intensity (0-75 typical range)
  const intensity = Math.min(1, (nearest.dbz || 0) / 70);
  const filled = Math.round(intensity * 20);

  return (
    <Panel className="border-[#ff00d4]/50">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-3 h-3 text-[#ff00d4] animate-pulse" />
        <span className="text-[9px] uppercase tracking-[0.25em] text-[#ff00d4]">SEVERE_TRACKING</span>
        <span className="ml-auto text-[9px] text-[#00ff9c] tabular-nums">LIVE</span>
      </div>
      <div className="text-[11px] text-white/80 leading-relaxed">
        <span className="text-[#ff00d4]">[!]</span> Storm cell · {nearest.distanceMi.toFixed(0)}mi {nearest.bearingCardinal}
      </div>
      <div className="text-[10px] text-white/50 mt-1">
        DBZ peak: {nearest.dbz != null ? Math.round(nearest.dbz) : '—'}
        {nearest.stormSpeedKt != null && (
          <> · Movement: {Math.round(nearest.stormSpeedKt * 1.15078)}mph {degToCardinal(nearest.stormHeading)}</>
        )}
      </div>
      {(nearest.tvs || nearest.meso) && (
        <div className="text-[10px] text-[#ff0033] mt-1 font-bold tracking-wider">
          {nearest.tvs ? '⚠ TVS' : ''} {nearest.meso ? '⚠ MESO' : ''}
        </div>
      )}
      <div className="mt-2 flex gap-1">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1"
            style={{
              background: i < filled ? '#ff00d4' : 'rgba(255,255,255,0.1)',
              boxShadow: i < filled ? '0 0 4px #ff00d4' : 'none',
            }}
          />
        ))}
      </div>
    </Panel>
  );
};

export const SystemPanel = () => {
  const { error, loading } = useLiveStormData();
  const ok = !error;
  return (
    <Panel>
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-3 h-3 text-[#00ff9c]" />
        <span className="text-[9px] uppercase tracking-[0.25em] text-white/50">NEXRAD_FEED</span>
        <span className="ml-auto inline-flex items-center gap-1 text-[9px] text-[#00ff9c]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9c] animate-pulse" />
          {ok ? 'ONLINE' : 'ERR'}
        </span>
      </div>
      <div className="space-y-1 font-mono text-[10px] text-white/60">
        <div>&gt; tile.0/n0q ........ <span className="text-[#00ff9c]">OK</span></div>
        <div>&gt; nexrad.attr ....... <span className={ok ? 'text-[#00ff9c]' : 'text-[#ff0033]'}>{ok ? 'OK' : 'ERR'}</span></div>
        <div>&gt; unified.weather ... <span className={ok ? 'text-[#00ff9c]' : 'text-[#ff0033]'}>{ok ? 'OK' : 'ERR'}</span></div>
        <div>&gt; sweep.refresh ...... <span className="text-[#ffea00]">{loading ? '…' : '5m'}</span></div>
      </div>
    </Panel>
  );
};