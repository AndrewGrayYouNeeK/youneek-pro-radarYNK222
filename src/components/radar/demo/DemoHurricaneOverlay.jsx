import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import L from "leaflet";
import AlertBanner from "@/components/home/AlertBanner";
import SafetyTextActions from "@/components/safety/SafetyTextActions";
import { demoHurricaneView } from "@/lib/demo/hurricaneFlag";
import {
  DEMO_CAMERAS,
  HARVEY_REPLAY_LABEL,
  N0Q_WMS_URL,
  RIDGE_WMS_URL,
  WARNING_POLYGON_STYLE,
  demoBannerAlert,
  harveyWarningCollection,
  reflectivityWmsParams,
  velocityWmsParams,
} from "@/lib/demo/hurricaneField";
import { RADAR_LAYERS_EVENT, loadRadarLayers } from "@/lib/radarLayers";
import { subscribeDemoMap } from "./installDemoHurricane";

function isLiveRadarTile(layer) {
  const url = layer?._url;
  if (typeof url !== "string" || url.length === 0) return false;
  if (url.includes("World_Dark_Gray")) return false;
  if (url.includes("n0q-t.cgi") || url.includes("/nexrad/ridge.cgi")) return false;
  return true;
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
    return () => {
      map.off("moveend", apply);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [map, camera.lat, camera.lon, camera.zoom]);

  useEffect(() => {
    if (!map) return undefined;
    setReady(false);
    const archive = view === "velocity"
      ? L.tileLayer.wms(RIDGE_WMS_URL, {
        ...velocityWmsParams(),
        uppercase: false,
        opacity: 0.95,
        zIndex: 660,
        attribution: "IEM KCRP N0U archive",
      })
      : L.tileLayer.wms(N0Q_WMS_URL, {
        ...reflectivityWmsParams(),
        uppercase: false,
        opacity: 0.92,
        zIndex: 650,
        attribution: "IEM NEXRAD N0Q archive",
      });
    const markReady = () => setReady(true);
    archive.on("load", markReady);
    archive.addTo(map);
    const backup = window.setTimeout(markReady, 8000);

    const showPolygons = view === "overview" || view === "alert";
    const polygons = showPolygons
      ? L.geoJSON(harveyWarningCollection(), { style: () => WARNING_POLYGON_STYLE }).addTo(map)
      : null;
    polygons?.bringToFront();

    return () => {
      window.clearTimeout(backup);
      [archive, polygons].forEach((item) => {
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
          {showSafety && <SafetyTextActions compact coords={{ latitude: 28.03, longitude: -97.05 }} />}
        </div>
      )}
      {view === "velocity" && (
        <div
          className="pointer-events-none absolute right-3 z-[1400] max-w-[11rem] rounded-xl border border-white/10 bg-slate-950/90 px-3 py-2 text-[11px] leading-snug text-slate-200 shadow-xl"
          style={{ top: "calc(4.2rem + env(safe-area-inset-top))" }}
        >
          KCRP N0U · 03:01 UTC
          <div className="text-slate-400">{HARVEY_REPLAY_LABEL}</div>
        </div>
      )}
    </div>
  );
}
