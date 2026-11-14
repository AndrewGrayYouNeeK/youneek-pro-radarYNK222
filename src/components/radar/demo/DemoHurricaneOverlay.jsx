import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import L from "leaflet";
import AlertBanner from "@/components/home/AlertBanner";
import SafetyTextActions from "@/components/safety/SafetyTextActions";
import { demoHurricaneView } from "@/lib/demo/hurricaneFlag";
import {
  DEMO_CAMERAS,
  STORM_CENTER,
  VELOCITY_STOPS,
  WARNING_POLYGON_STYLE,
  demoBannerAlert,
  sampleStorm,
  trackLatLngs,
  WARNING_RING,
} from "@/lib/demo/hurricaneField";
import { RADAR_LAYERS_EVENT, loadRadarLayers } from "@/lib/radarLayers";
import { subscribeDemoMap } from "./installDemoHurricane";

function isLiveRadarTile(layer) {
  return typeof layer?._url === "string" && layer._url.length > 0 && !layer._url.includes("World_Dark_Gray");
}

function Legend({ rows, title }) {
  return (
    <div className="pointer-events-none absolute right-3 z-[1400] w-36 rounded-xl border border-white/10 bg-slate-950/90 p-2 shadow-xl" style={{ top: "calc(4.2rem + env(safe-area-inset-top))" }}>
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</div>
      <div className="flex flex-col gap-1">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-2">
            <span className="h-2.5 w-5 rounded-sm" style={{ background: row.color }} />
            <span className="text-[11px] text-slate-200">{row.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DemoHurricaneOverlay() {
  const location = useLocation();
  const view = demoHurricaneView(location.search) || "overview";
  const camera = DEMO_CAMERAS[view] || DEMO_CAMERAS.overview;
  const [map, setMap] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => subscribeDemoMap(setMap), []);

  useEffect(() => {
    if (!map) return undefined;
    const quiet = {
      ...loadRadarLayers(),
      lightning: false,
      storms: false,
      cells: false,
      fires: false,
      precip: false,
      wind: false,
    };
    window.dispatchEvent(new CustomEvent(RADAR_LAYERS_EVENT, { detail: quiet }));
    return () => {
      window.dispatchEvent(new CustomEvent(RADAR_LAYERS_EVENT, { detail: loadRadarLayers() }));
    };
  }, [map]);

  useEffect(() => {
    if (!map) return undefined;
    const muted = [];
    const mute = (layer) => {
      if (!isLiveRadarTile(layer)) return;
      if (layer.__ynkDemoOpacity == null) {
        layer.__ynkDemoOpacity = layer.options?.opacity ?? 1;
        muted.push(layer);
      }
      layer.setOpacity(0);
    };
    const onLayerAdd = (event) => mute(event.layer);
    map.eachLayer(mute);
    map.on("layeradd", onLayerAdd);
    return () => {
      map.off("layeradd", onLayerAdd);
      muted.forEach((layer) => {
        if (layer.__ynkDemoOpacity != null) layer.setOpacity(layer.__ynkDemoOpacity);
        delete layer.__ynkDemoOpacity;
      });
    };
  }, [map]);

  useEffect(() => {
    if (!map) return undefined;
    const until = Date.now() + 12000;
    const apply = () => {
      if (Date.now() > until) {
        map.off("moveend", apply);
        return;
      }
      const center = map.getCenter();
      const zoom = map.getZoom();
      const closeEnough = Math.abs(center.lat - camera.lat) < 0.03
        && Math.abs(center.lng - camera.lon) < 0.03
        && Math.abs(zoom - camera.zoom) < 0.2;
      if (closeEnough) return;
      map.setView([camera.lat, camera.lon], camera.zoom, { animate: false });
    };
    apply();
    map.on("moveend", apply);
    const timers = [500, 1500, 3000, 6000].map((delay) => window.setTimeout(apply, delay));
    const frame = window.requestAnimationFrame(() => setReady(true));
    return () => {
      map.off("moveend", apply);
      timers.forEach((timer) => window.clearTimeout(timer));
      window.cancelAnimationFrame(frame);
    };
  }, [map, camera.lat, camera.lon, camera.zoom]);

  useEffect(() => {
    if (!map) return undefined;
    const mode = view === "velocity" ? "velocity" : "reflectivity";
    const layer = L.gridLayer({
      tileSize: 256,
      opacity: 0.9,
      zIndex: 650,
      updateWhenIdle: false,
      updateWhenZooming: false,
      keepBuffer: 2,
    });
    layer.createTile = function createTile(coords) {
      const tile = document.createElement("canvas");
      const size = this.getTileSize().x;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      tile.width = Math.round(size * ratio);
      tile.height = Math.round(size * ratio);
      const ctx = tile.getContext("2d");
      const image = ctx.createImageData(tile.width, tile.height);
      const pixels = image.data;
      const mapRef = this._map;
      const step = 2;
      for (let py = 0; py < tile.height; py += step) {
        for (let px = 0; px < tile.width; px += step) {
          const latlng = mapRef.unproject(
            L.point(coords.x * size + px / ratio, coords.y * size + py / ratio),
            coords.z
          );
          const sample = sampleStorm(latlng.lat, latlng.lng, mode);
          if (!sample) continue;
          for (let oy = 0; oy < step; oy += 1) {
            for (let ox = 0; ox < step; ox += 1) {
              const index = ((py + oy) * tile.width + (px + ox)) * 4;
              pixels[index] = sample[0];
              pixels[index + 1] = sample[1];
              pixels[index + 2] = sample[2];
              pixels[index + 3] = sample[3];
            }
          }
        }
      }
      ctx.putImageData(image, 0, 0);
      return tile;
    };
    layer.addTo(map);

    const polygon = L.polygon(
      WARNING_RING.map(([lon, lat]) => [lat, lon]),
      WARNING_POLYGON_STYLE
    ).addTo(map);
    polygon.bringToFront();

    const showTrack = view === "overview" || view === "alert";
    const track = showTrack
      ? L.polyline(trackLatLngs(), {
        color: "#fb7185",
        weight: 3,
        opacity: 0.95,
        dashArray: "7 5",
      }).addTo(map)
      : null;

    const icon = L.divIcon({
      className: "",
      html: '<div style="width:14px;height:14px;margin-left:-1px;margin-top:-1px;border:2px solid #fecdd3;border-radius:999px;background:#e11d48;box-shadow:0 0 0 5px rgba(225,29,72,0.28)"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
    const marker = L.marker([STORM_CENTER.lat, STORM_CENTER.lon], { icon, interactive: false }).addTo(map);

    return () => {
      [layer, polygon, track, marker].forEach((item) => {
        if (item && map.hasLayer(item)) map.removeLayer(item);
      });
    };
  }, [map, view]);

  const showBanner = view === "overview" || view === "alert";
  const showSafety = view === "alert";

  return (
    <div className="pointer-events-none absolute inset-0 z-[1400]" data-demo-hurricane-ready={ready ? view : ""}>
      {showBanner && (
        <div
          className="pointer-events-auto absolute left-3 flex w-[min(22rem,calc(100%-5.5rem))] flex-col gap-2"
          style={{ top: "calc(3.6rem + env(safe-area-inset-top))" }}
        >
          <AlertBanner alerts={[demoBannerAlert()]} />
          {showSafety && <SafetyTextActions compact coords={{ latitude: 29.27, longitude: -94.82 }} />}
        </div>
      )}
      {view === "velocity" && <Legend title="Base velocity" rows={VELOCITY_STOPS} />}
    </div>
  );
}
