import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Radio, Layers, Loader2, AlertTriangle } from 'lucide-react';

// Real NEXRAD radar tiles from Iowa State University Mesonet
// (public NEXRAD WMS/TMS service used across the industry)
const NEXRAD_BASE = 'https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913';
const DARK_BASE = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

export default function LiveRadar() {
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const radarRef = useRef(null);
  const warningsLayerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [ts, setTs] = useState(Date.now());
  const [warningCount, setWarningCount] = useState(0);

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

  return (
    <section id="radar" className="relative bg-black py-24 px-5 md:px-8 overflow-hidden border-t border-[#00ff9c]/20">
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
          <div className="flex items-center gap-4 text-[10px] tracking-[0.25em] uppercase font-mono">
            <span className="inline-flex items-center gap-2 text-[#00ff9c]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9c] animate-pulse" /> LIVE
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
      </div>
    </section>
  );
}