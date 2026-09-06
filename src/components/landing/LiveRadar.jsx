import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Radio, Layers, Loader2, AlertTriangle, Play, Pause, Rewind } from 'lucide-react';
import { useLocation } from './LocationContext';

// Real NEXRAD radar tiles from Iowa State University Mesonet
// (public NEXRAD WMS/TMS service used across the industry)
const NEXRAD_BASE = 'https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913';
// Archived 5-minute frames: ridge::USCOMP-N0Q-YYYYMMDDHHMM (UTC, rounded to 5 min)
const NEXRAD_ARCHIVE = 'https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-N0Q-';
const DARK_BASE = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';

// Build last N timestamps (UTC), every 5 min, ending ~10 min ago to ensure availability
const buildFrameTimestamps = (count = 10) => {
  const out = [];
  const now = new Date();
  // Round down to nearest 5 minutes, then back off 10 min to let tiles publish
  now.setUTCSeconds(0, 0);
  now.setUTCMinutes(now.getUTCMinutes() - (now.getUTCMinutes() % 5) - 10);
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 5 * 60 * 1000);
    const pad = (n) => String(n).padStart(2, '0');
    const stamp =
      d.getUTCFullYear() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes());
    out.push({ stamp, date: d });
  }
  return out;
};

export default function LiveRadar() {
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const radarRef = useRef(null);
  const warningsLayerRef = useRef(null);
  const gpsMarkerRef = useRef(null);
  const frameLayersRef = useRef([]);
  const playTimerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [ts, setTs] = useState(Date.now());
  const [warningCount, setWarningCount] = useState(0);
  const [loopMode, setLoopMode] = useState(false);
  const [frames, setFrames] = useState([]);
  const [frameIdx, setFrameIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const { location } = useLocation();

  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;

    const map = L.map(mapEl.current, {
      center: [37.5, -96],
      zoom: 4,
      zoomControl: true,
      attributionControl: false,
    });
    mapRef.current = map;

    L.tileLayer(DARK_BASE, { maxZoom: 10 }).addTo(map);

    radarRef.current = L.tileLayer(`${NEXRAD_BASE}/{z}/{x}/{y}.png`, {
      opacity: 0.75,
      maxZoom: 10,
    }).addTo(map);

    radarRef.current.on('load', () => setLoading(false));

    // Tornado warning polygons layer
    warningsLayerRef.current = L.layerGroup().addTo(map);

    const fetchWarnings = async () => {
      try {
        const res = await fetch(
          'https://api.weather.gov/alerts/active?event=Tornado%20Warning',
          { headers: { Accept: 'application/geo+json' } }
        );
        const data = await res.json();
        const features = (data.features || []).filter((f) => f.geometry);

        warningsLayerRef.current.clearLayers();
        features.forEach((f) => {
          const layer = L.geoJSON(f.geometry, {
            style: {
              color: '#ff0033',
              weight: 2,
              fillColor: '#ff0033',
              fillOpacity: 0.18,
              dashArray: '4,3',
            },
          });
          const p = f.properties || {};
          const expires = p.expires ? new Date(p.expires).toUTCString().slice(17, 22) : '';
          layer.bindPopup(
            `<div style="font-family:monospace;color:#000;min-width:180px">
              <div style="background:#ff0033;color:#fff;padding:4px 6px;font-weight:bold;font-size:11px;letter-spacing:1px">TORNADO WARNING</div>
              <div style="padding:6px 4px;font-size:11px">
                <div><b>${p.areaDesc || ''}</b></div>
                <div style="margin-top:4px;opacity:0.7">Expires: ${expires} UTC</div>
              </div>
            </div>`
          );
          warningsLayerRef.current.addLayer(layer);
        });
        setWarningCount(features.length);
      } catch (_) {
        // silent
      }
    };

    fetchWarnings();

    // Auto-refresh radar every 2 minutes (real NEXRAD updates ~every 2-5 min)
    const interval = setInterval(() => {
      if (!radarRef.current) return;
      const newTs = Date.now();
      setTs(newTs);
      radarRef.current.setUrl(`${NEXRAD_BASE}/{z}/{x}/{y}.png?ts=${newTs}`);
    }, 120000);

    // Refresh warnings every 60s
    const warnInterval = setInterval(fetchWarnings, 60000);

    return () => {
      clearInterval(interval);
      clearInterval(warnInterval);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // GPS location dot — update when location changes
  useEffect(() => {
    if (!mapRef.current || !location?.lat || !location?.lon) return;

    if (gpsMarkerRef.current) {
      gpsMarkerRef.current.remove();
    }

    const icon = L.divIcon({
      className: '',
      html: `
        <div style="position:relative;width:18px;height:18px;">
          <span style="position:absolute;inset:0;border-radius:50%;background:#00ff9c;opacity:0.35;animation:gpsPulse 1.8s ease-out infinite;"></span>
          <span style="position:absolute;inset:5px;border-radius:50%;background:#00ff9c;box-shadow:0 0 10px #00ff9c,0 0 4px #fff;border:2px solid #000;"></span>
        </div>
        <style>@keyframes gpsPulse{0%{transform:scale(0.6);opacity:0.6}100%{transform:scale(2.4);opacity:0}}</style>
      `,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    gpsMarkerRef.current = L.marker([location.lat, location.lon], { icon, zIndexOffset: 1000 })
      .addTo(mapRef.current)
      .bindPopup(
        `<div style="font-family:monospace;color:#000;font-size:11px">
          <b>${location.label || 'Your location'}</b><br/>
          <span style="opacity:0.6">${location.lat.toFixed(3)}, ${location.lon.toFixed(3)}</span>
        </div>`
      );

    mapRef.current.setView([location.lat, location.lon], 7);
  }, [location]);

  // Build/teardown frame layers when loop mode is toggled
  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up any previous frame layers
    frameLayersRef.current.forEach((l) => mapRef.current.removeLayer(l));
    frameLayersRef.current = [];

    if (!loopMode) {
      // Restore live radar layer
      if (radarRef.current && !mapRef.current.hasLayer(radarRef.current)) {
        radarRef.current.addTo(mapRef.current);
      }
      return;
    }

    // Hide live layer while looping
    if (radarRef.current && mapRef.current.hasLayer(radarRef.current)) {
      mapRef.current.removeLayer(radarRef.current);
    }

    const stamps = buildFrameTimestamps(10);
    setFrames(stamps);
    setFrameIdx(stamps.length - 1);

    stamps.forEach((f, i) => {
      const layer = L.tileLayer(`${NEXRAD_ARCHIVE}${f.stamp}/{z}/{x}/{y}.png`, {
        opacity: i === stamps.length - 1 ? 0.75 : 0,
        maxZoom: 10,
      }).addTo(mapRef.current);
      frameLayersRef.current.push(layer);
    });
  }, [loopMode]);

  // Animate frames when playing
  useEffect(() => {
    if (!loopMode || !playing || frames.length === 0) {
      clearInterval(playTimerRef.current);
      return;
    }
    playTimerRef.current = setInterval(() => {
      setFrameIdx((i) => (i + 1) % frames.length);
    }, 600);
    return () => clearInterval(playTimerRef.current);
  }, [loopMode, playing, frames.length]);

  // Show only the active frame
  useEffect(() => {
    frameLayersRef.current.forEach((layer, i) => {
      layer.setOpacity(i === frameIdx ? 0.75 : 0);
    });
  }, [frameIdx]);

  const activeFrame = frames[frameIdx];

  return (
    <section id="radar" className="relative bg-black py-24 px-5 md:px-8 overflow-hidden border-t border-[#00ff9c]/20 scroll-mt-32">
      <div className="absolute inset-0 [background:radial-gradient(ellipse_at_top,rgba(0,255,156,0.1),transparent_60%)]" />
      <div className="relative max-w-7xl mx-auto">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="text-[10px] tracking-[0.4em] uppercase text-[#00ff9c] mb-3 font-mono">
              // NEXRAD_LIVE_FEED
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-[0.95] tracking-tight text-white">
              Live <span className="text-[#00ff9c]">NEXRAD</span> Radar
            </h2>
            <p className="mt-3 text-sm text-white/60 max-w-xl">
              Real-time base reflectivity (N0Q) sourced from NOAA NEXRAD via Iowa State Mesonet.
              Auto-refreshes every 2 minutes.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[10px] tracking-[0.25em] uppercase font-mono flex-wrap">
            <span className={`inline-flex items-center gap-2 ${loopMode ? 'text-white/40' : 'text-[#00ff9c]'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${loopMode ? 'bg-white/40' : 'bg-[#00ff9c] animate-pulse'}`} />
              {loopMode ? 'LOOP' : 'LIVE'}
            </span>
            <span className="text-white/50">
              <Layers className="inline w-3 h-3 mr-1" /> N0Q · 900913
            </span>
            <span className="text-white/40">
              {new Date(ts).toUTCString().slice(17, 25)} UTC
            </span>
            <span className={`inline-flex items-center gap-1.5 ${warningCount > 0 ? 'text-[#ff0033]' : 'text-white/40'}`}>
              <AlertTriangle className="w-3 h-3" />
              {warningCount} TOR WARN
            </span>
            <button
              onClick={() => setLoopMode(!loopMode)}
              className={`inline-flex items-center gap-1.5 px-2 py-1 border transition ${
                loopMode
                  ? 'border-[#ff00d4] bg-[#ff00d4]/10 text-[#ff00d4]'
                  : 'border-[#00ff9c]/40 text-[#00ff9c] hover:bg-[#00ff9c]/10'
              }`}
            >
              <Rewind className="w-3 h-3" />
              {loopMode ? 'EXIT LOOP' : 'LOOP'}
            </button>
          </div>
        </div>

        <div className="relative border border-[#00ff9c]/30 bg-black isolate z-[80]">
          <span className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-[#00ff9c] z-[401]" />
          <span className="absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 border-[#ff00d4] z-[401]" />
          <span className="absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 border-[#ff00d4] z-[401]" />
          <span className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-[#00ff9c] z-[401]" />

          <div ref={mapEl} className="w-full h-[420px] md:h-[560px] z-0" />

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-[400]">
              <div className="inline-flex items-center gap-3 px-4 py-2 border border-[#00ff9c]/40 text-[#00ff9c] text-[10px] tracking-[0.3em] uppercase">
                <Loader2 className="w-4 h-4 animate-spin" /> Connecting to NEXRAD…
              </div>
            </div>
          )}

          <div className="absolute bottom-2 right-2 z-[400] text-[9px] text-white/50 bg-black/70 px-2 py-1 font-mono">
            <Radio className="inline w-3 h-3 mr-1 text-[#00ff9c]" />
            NOAA NEXRAD · Iowa State Mesonet · CartoDB
          </div>
        </div>

        {/* Loop playback controls */}
        {loopMode && frames.length > 0 && (
          <div className="mt-3 border border-[#ff00d4]/40 bg-black/80 backdrop-blur p-3 flex items-center gap-3">
            <button
              onClick={() => setPlaying(!playing)}
              className="w-8 h-8 flex items-center justify-center bg-[#ff00d4] text-black hover:bg-white transition"
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
            </button>
            <input
              type="range"
              min={0}
              max={frames.length - 1}
              value={frameIdx}
              onChange={(e) => { setPlaying(false); setFrameIdx(parseInt(e.target.value, 10)); }}
              className="flex-1 accent-[#ff00d4]"
            />
            <div className="text-[10px] tracking-[0.25em] uppercase font-mono text-[#ff00d4] tabular-nums whitespace-nowrap">
              {activeFrame ? activeFrame.date.toUTCString().slice(17, 22) + ' UTC' : '—'}
            </div>
            <div className="text-[9px] tracking-[0.25em] uppercase font-mono text-white/40 tabular-nums whitespace-nowrap hidden sm:block">
              {frameIdx + 1}/{frames.length}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}