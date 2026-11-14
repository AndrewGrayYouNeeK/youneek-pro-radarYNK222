import { useEffect, useMemo, useRef, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import { Layers, LocateFixed } from "lucide-react";
import RadarLayersMenu from "./RadarLayersMenu";
import RadarPlaybackDock from "./RadarPlaybackDock";
import ShelterAlert from "./ShelterAlert";
import RadarQuickActions from "./RadarQuickActions";
import WindSpeedDisplay from "./WindSpeedDisplay";
import TimeLapseBar from "./TimeLapseBar";
import RadarFrameStatus from "./RadarFrameStatus";
import LightningLayer from "./LightningLayer";
import HurricaneLayer from "./HurricaneLayer";
import StormCellLayer from "./StormCellLayer";
import WindFieldLayer from "./WindFieldLayer";
import WildfireLayer from "./WildfireLayer";
import { rainViewerLeafletUrl } from "@/lib/weather/rainviewer";
import ProLegend from "./ProLegend";
import RadarDataDock from "./RadarDataDock";
import RadarInspectorPanel from "./RadarInspectorPanel";
import RadarStatusBar from "./RadarStatusBar";
import RainArrivalAlert from "./RainArrivalAlert";
import StormToolsPanel from "./StormToolsPanel";
import TargetList from "./TargetList";
import { getRadarProduct, productTileUrl } from "./radarProducts";
import LayerSheet from "./LayerSheet";
import ExtraMapLayers from "./ExtraMapLayers";
import { buildRadarLoop, loadLoopFrameCount, loadLoopSpeed, saveLoopFrameCount, saveLoopSpeed } from "@/lib/radar/loopFrames";
import { NATIONAL_MOSAIC_ID, resolveRadarSite, ridgeProductLabel } from "@/lib/radar/ridgeTiles";
import { weatherQueryCoords } from "@/lib/locationStability";
import usePullToRefresh from "@/hooks/usePullToRefresh";
import useMapDesk from "@/hooks/useMapDesk";
import { fetchNwsPointAlerts } from "@/lib/api/nwsAlerts";
import { readSafetyPreview } from "@/lib/safety/safetyPreview";
import { activeSafetyAlerts } from "@/lib/safety/weatherEmergency";
import { getMapFeature } from "@/lib/mapDesk";
import { RADAR_LAYERS_EVENT, loadRadarLayers, saveRadarLayers } from "@/lib/radarLayers";
import LocationSearch from "@/components/location/LocationSearch";
import RadarAlertSheet from "./RadarAlertSheet";
import SafetyTextActions from "@/components/safety/SafetyTextActions";
import { alertSummary, warningFeatures } from "@/lib/radar/alertText";
import { latestProductScanUnix } from "@/lib/radar/productAge";
import { readCachedJson, writeCachedJson } from "@/lib/offlineCache";
import { hapticSevereWarning } from "@/lib/native/haptics";
import { loadActiveLocation, saveActiveLocation } from "@/lib/locationStore";
import { loadShelterContacts, sendContactTexts } from "@/lib/safety/sms";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const STATION_COORDS = {
  KOKX: [40.866, -72.864], KBOX: [41.956, -71.137], KBGM: [42.2, -75.985],
  KBUF: [42.949, -78.737], KENX: [42.586, -74.064], KPBZ: [40.532, -80.218],
  KCCX: [40.923, -78.004], KDIX: [39.947, -74.411], KCBW: [46.039, -67.806],
  KGYX: [43.891, -70.257], KDOX: [38.826, -75.44], KAKQ: [36.984, -77.007],
  KLWX: [38.975, -77.478], KFCX: [37.024, -80.274], KRNK: [37, -80.271],
  KFFC: [33.364, -84.566], KAMX: [25.611, -80.413], KTBW: [27.705, -82.402],
  KJAX: [30.485, -81.702], KCLX: [32.656, -81.042], KRAX: [35.665, -78.49],
  KMHX: [34.776, -76.876], KLTX: [33.989, -78.429], KGSP: [34.883, -82.22],
  KJGX: [32.675, -83.351], KVAX: [30.89, -83.002], KEVX: [30.564, -85.922],
  KMLB: [28.113, -80.654], KBYX: [24.597, -81.703], KIND: [39.708, -86.28],
  KILN: [39.42, -83.822], KLVX: [37.975, -85.944], KHPX: [36.737, -87.645],
  KJKL: [37.59, -83.313], KPAH: [37.068, -88.772], KOHX: [36.247, -86.563],
  KNQA: [35.345, -89.873], KHTX: [34.931, -86.084], KBMX: [33.172, -86.77],
  KGWX: [33.897, -88.329], KIWX: [41.408, -85.7], KLOT: [41.604, -88.085],
  KGRR: [42.894, -85.545], KAPX: [44.907, -84.72], KMKX: [42.968, -88.551],
  KDTX: [42.7, -83.472], KCLE: [41.413, -81.86], KDVN: [41.612, -90.581],
  KILX: [40.151, -89.337], KLSX: [38.699, -90.683], KEAX: [38.81, -94.264],
  KTWX: [38.997, -96.232], KICT: [37.655, -97.443], KDMX: [41.731, -93.723],
  KARX: [43.823, -91.191], KMPX: [44.849, -93.566], KDLH: [46.837, -92.21],
  KLZK: [34.836, -92.262], KTLX: [35.333, -97.278], KINX: [36.175, -95.565],
  KFWS: [32.573, -97.303], KSHV: [32.451, -93.841], KPOE: [31.155, -92.976],
  KLIX: [30.337, -89.825], KMOB: [30.679, -88.24], KSJT: [31.371, -100.493],
  KEWX: [29.704, -98.029], KCRP: [27.784, -97.511], KBRO: [25.916, -97.419],
  KHGX: [29.472, -95.079], KLCH: [30.125, -93.216], KABR: [45.456, -98.413],
  KBIS: [46.771, -100.76], KMBX: [48.393, -100.865], KFSD: [43.588, -96.729],
  KUEX: [40.321, -98.442], KOAX: [41.32, -96.367], KDDC: [37.761, -99.969],
  KAMA: [35.234, -101.709], KLBB: [33.654, -101.814], KMAF: [31.943, -102.189],
  KUDX: [44.125, -102.83], KGGW: [48.206, -106.625], KFTG: [39.787, -104.546],
  KPUX: [38.46, -104.182], KGJX: [39.062, -108.214], KIWA: [33.289, -111.67],
  KEMX: [31.894, -110.63], KABX: [35.15, -106.824], KFSX: [34.574, -111.198],
  KESX: [35.701, -114.891], KVTX: [34.412, -119.179], KHNX: [36.314, -119.632],
  KMUX: [37.155, -121.898], KBBX: [39.496, -121.632], KBHX: [40.498, -124.292],
  KMAX: [42.081, -122.717], KLGX: [47.117, -124.106], KATX: [47.52, -122.494],
  KRTX: [45.715, -122.965], KPDT: [45.691, -118.853], KOTX: [47.681, -117.627],
  KMSX: [47.041, -113.986], KTFX: [47.46, -111.385], KCBX: [43.491, -116.236],
};

const ALERT_LAYER_COLORS = {
  tornado: "#ef4444",
  severe: "#f97316",
  flood: "#3b82f6",
  winter: "#a855f7",
  heat: "#f43f5e",
  wind: "#22d3ee",
  fire: "#fb7185",
};

const invalidateMapSize = (map) => {
  requestAnimationFrame(() => {
    if (!map || !map.getContainer?.() || !map._loaded) return;
    map.invalidateSize({ pan: false, animate: false });
  });

  setTimeout(() => {
    if (!map || !map.getContainer?.() || !map._loaded) return;
    map.invalidateSize({ pan: false, animate: false });
  }, 150);
};

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function getGeometryPoints(geometry) {
  if (!geometry?.coordinates) return [];
  const flattenCoords = (coords) => { if (!Array.isArray(coords[0])) return [coords]; return coords.flatMap(flattenCoords); };
  return flattenCoords(geometry.coordinates).filter((point) => Array.isArray(point) && point.length >= 2);
}
function isFeatureNearLocation(feature, userLocation, maxDistanceKm = 150) {
  const points = getGeometryPoints(feature?.geometry);
  return points.some(([lon, lat]) => haversineKm(lat, lon, userLocation.lat, userLocation.lon) <= maxDistanceKm);
}

export default function RadarDisplay({
  settings,
  showNexrad,
  onSettingsChange,
  showRadio,
  onToggleRadio,
  showTools,
  onToolsToggle,
  targets = [],
  onMapClick,
  onTargetClick,
  onDeleteTarget,
  variant = "clean",
}) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const radarLayerRef = useRef(null);
  const frameLayersRef = useRef([]);
  const tornadoLayerRef = useRef(null);
  const tornadoWatchLayerRef = useRef(null);
  const severeWatchLayerRef = useRef(null);
  const thunderLayerRef = useRef(null);
  const floodLayerRef = useRef(null);
  const winterLayerRef = useRef(null);
  const heatLayerRef = useRef(null);
  const windLayerRef = useRef(null);
  const fireWxLayerRef = useRef(null);
  const satelliteLayerRef = useRef(null);
  const tempLayerRef = useRef(null);
  const cloudLayerRef = useRef(null);
  const precipLayerRef = useRef(null);
  const loopFramesRef = useRef([]);
  const refreshTimerRef = useRef(null);
  const userLocationMarkerRef = useRef(null);
  const baseLayerRef = useRef(null);
  const stationPanRef = useRef(null);
  const suppressMapClickRef = useRef(false);

  const [showTornado, setShowTornado] = useState(() => loadRadarLayers().alertTornado);
  const [showThunderstorm, setShowThunderstorm] = useState(() => loadRadarLayers().alertSevere);
  const [showFlood, setShowFlood] = useState(() => loadRadarLayers().alertFlood);
  const [showWinter, setShowWinter] = useState(() => loadRadarLayers().alertWinter);
  const [showHeat, setShowHeat] = useState(() => loadRadarLayers().alertHeat);
  const [showWind, setShowWind] = useState(() => loadRadarLayers().alertWind);
  const [showFireWx, setShowFireWx] = useState(() => loadRadarLayers().alertFire);
  const [showLightning, setShowLightning] = useState(() => loadRadarLayers().lightning);
  const [showHurricanes, setShowHurricanes] = useState(() => loadRadarLayers().storms);
  const [showCells, setShowCells] = useState(() => loadRadarLayers().cells);
  const [showSatellite, setShowSatellite] = useState(() => loadRadarLayers().satellite);
  const [showGlobalRadar, setShowGlobalRadar] = useState(false);
  const [showFutureRadar, setShowFutureRadar] = useState(false);
  const [showTornadoWatch, setShowTornadoWatch] = useState(false);
  const [showSevereWatch, setShowSevereWatch] = useState(false);
  const [satelliteMode, setSatelliteMode] = useState("off");
  const [surfaceField, setSurfaceField] = useState("off");
  const [showPerimeters, setShowPerimeters] = useState(false);
  const [showSnow, setShowSnow] = useState(false);
  const [showAir, setShowAir] = useState(false);
  const [showQuakes, setShowQuakes] = useState(false);
  const [showFronts, setShowFronts] = useState(false);
  const [showSpc1, setShowSpc1] = useState(false);
  const [showSpc2, setShowSpc2] = useState(false);
  const [showSpc3, setShowSpc3] = useState(false);
  const [showMd, setShowMd] = useState(false);
  const [radarRefresh, setRadarRefresh] = useState(0);
  const [nearestSite, setNearestSite] = useState("KTLX");
  const [loopSource, setLoopSource] = useState("past");
  const [showFires, setShowFires] = useState(() => loadRadarLayers().fires);
  const [showTemps, setShowTemps] = useState(() => loadRadarLayers().temps);
  const [showClouds, setShowClouds] = useState(() => loadRadarLayers().clouds);
  const [showPrecip, setShowPrecip] = useState(() => loadRadarLayers().precip);
  const [showWindField, setShowWindField] = useState(() => loadRadarLayers().wind);
  const [radarCatalog, setRadarCatalog] = useState(null);
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [loopPlaying, setLoopPlaying] = useState(false);
  const [loopSpeed, setLoopSpeedState] = useState(loadLoopSpeed);
  const [loopFrameCount, setLoopFrameCountState] = useState(loadLoopFrameCount);
  const setLoopSpeed = (value) => setLoopSpeedState(saveLoopSpeed(value));
  const setLoopFrameCount = (value) => setLoopFrameCountState(saveLoopFrameCount(value));
  const [loopError, setLoopError] = useState(false);
  const [loopAttempt, setLoopAttempt] = useState(0);
  const [productScanUnix, setProductScanUnix] = useState(null);
  const [baseMapError, setBaseMapError] = useState(false);
  const [radarTileError, setRadarTileError] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [alertsError, setAlertsError] = useState(false);
  const [alertsStale, setAlertsStale] = useState(false);
  const [alertAttempt, setAlertAttempt] = useState(0);
  const [alertSheet, setAlertSheet] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [loopIndex, setLoopIndex] = useState(0);
  const [loopFrames, setLoopFrames] = useState([]);
  const [userLocation, setUserLocation] = useState(() => {
    const saved = typeof window === "undefined" ? null : loadActiveLocation();
    return saved?.latitude != null ? { lat: saved.latitude, lon: saved.longitude } : null;
  });
  const [activeTornadoWarning, setActiveTornadoWarning] = useState(false);
  const [activeTornadoWatch, setActiveTornadoWatch] = useState(false);
  const [alertCollection, setAlertCollection] = useState(() => readCachedJson("ynk-alerts-v1"));
  const [warningCount, setWarningCount] = useState(0);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLayersMenuOpen, setIsLayersMenuOpen] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const locationErrorTimerRef = useRef(null);
  const [windData, setWindData] = useState(null);
  const windFetchTimerRef = useRef(null);
  const [initialLocationSet, setInitialLocationSet] = useState(false);
  const [inspector, setInspector] = useState(null);
  const [stormData, setStormData] = useState(null);
  const clickContextRef = useRef({ userLocation: null, windData: null, onMapClick: null });
  const navigate = useNavigate();
  const { dockIds, togglePin, move, reset } = useMapDesk();
  const savedPlace = typeof window === "undefined" ? null : loadActiveLocation();
  const alertLat = userLocation?.lat ?? savedPlace?.latitude;
  const alertLon = userLocation?.lon ?? savedPlace?.longitude;
  const [roundedAlertLat, roundedAlertLon] = weatherQueryCoords(alertLat, alertLon);
  const pointAlertsQuery = useQuery({
    queryKey: ["nws-point-alerts", roundedAlertLat, roundedAlertLon],
    enabled: alertLat != null && alertLon != null,
    placeholderData: keepPreviousData,
    staleTime: 120000,
    queryFn: () => fetchNwsPointAlerts(roundedAlertLat, roundedAlertLon),
  });
  const [safetyPreview] = useState(() =>
    typeof window === "undefined" ? null : readSafetyPreview(window.location.search)
  );
  const showSafetyTexts = useMemo(() => {
    const live = Array.isArray(pointAlertsQuery.data) ? pointAlertsQuery.data : [];
    return activeSafetyAlerts(safetyPreview ? [safetyPreview, ...live] : live).length > 0;
  }, [pointAlertsQuery.data, safetyPreview]);

  useEffect(() => {
    clickContextRef.current = { userLocation, windData, onMapClick };
  }, [userLocation, windData, onMapClick]);

  const settingsRef = useRef(settings);
  const onSettingsChangeRef = useRef(onSettingsChange);
  useEffect(() => {
    settingsRef.current = settings;
    onSettingsChangeRef.current = onSettingsChange;
  }, [settings, onSettingsChange]);

  useEffect(() => {
    const apply = (event) => {
      const next = event.detail || loadRadarLayers();
      setShowSatellite(Boolean(next.satellite));
      setShowTemps(Boolean(next.temps));
      setShowClouds(Boolean(next.clouds));
      setShowPrecip(Boolean(next.precip));
      setShowWindField(Boolean(next.wind));
      setShowLightning(Boolean(next.lightning));
      setShowHurricanes(Boolean(next.storms));
      setShowCells(Boolean(next.cells));
      setShowFires(Boolean(next.fires));
      setShowTornado(Boolean(next.alertTornado));
      setShowThunderstorm(Boolean(next.alertSevere));
      setShowFlood(Boolean(next.alertFlood));
      setShowWinter(Boolean(next.alertWinter));
      setShowHeat(Boolean(next.alertHeat));
      setShowWind(Boolean(next.alertWind));
      setShowFireWx(Boolean(next.alertFire));
      const current = settingsRef.current;
      if (Boolean(next.radar) !== Boolean(current?.showNexrad)) {
        onSettingsChangeRef.current?.({ ...current, showNexrad: Boolean(next.radar) });
      }
    };
    window.addEventListener(RADAR_LAYERS_EVENT, apply);
    return () => window.removeEventListener(RADAR_LAYERS_EVENT, apply);
  }, []);

  const mapCenter = leafletMap.current?.getCenter();
  const activeWarningsCount = warningCount;

  const alertToggles = {
    tornado: showTornado,
    severe: showThunderstorm,
    flood: showFlood,
    winter: showWinter,
    heat: showHeat,
    wind: showWind,
    fire: showFireWx,
  };
  const alertTogglesRef = useRef(alertToggles);

  // Helper function to find nearest NEXRAD station
  const findNearestStation = (lat, lon) => {
    let nearestStation = 'KJKL';
    let minDistance = Infinity;

    Object.entries(STATION_COORDS).forEach(([stationId, [stationLat, stationLon]]) => {
      const distance = haversineKm(lat, lon, stationLat, stationLon);
      if (distance < minDistance) {
        minDistance = distance;
        nearestStation = stationId;
      }
    });

    return nearestStation;
  };

  useEffect(() => {
    if (leafletMap.current || !mapRef.current) return undefined;
    const saved = loadActiveLocation();
    const coords = saved?.latitude != null ? [saved.latitude, saved.longitude] : [39.5, -98.35];
    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: true,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      touchZoom: true,
      bounceAtZoomLimits: false,
      inertia: true,
      minZoom: 4,
      maxZoom: 12,
    }).setView(coords, saved?.latitude != null ? 8 : 5);
    leafletMap.current = map;
    const baseLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Esri, HERE, Garmin, FAO, NOAA, USGS",
      maxZoom: 16,
      updateWhenIdle: false,
      updateWhenZooming: true,
      keepBuffer: 2,
      crossOrigin: "anonymous",
    }).addTo(map);
    baseLayerRef.current = baseLayer;
    let sawTile = false;
    const markReady = () => {
      if (!leafletMap.current) return;
      setIsMapReady(true);
      invalidateMapSize(leafletMap.current);
    };
    baseLayer.on("tileload", () => {
      sawTile = true;
      setBaseMapError(false);
      markReady();
    });
    const errorTimer = window.setTimeout(() => {
      if (!sawTile) setBaseMapError(true);
    }, 8000);
    const readyTimer = window.setTimeout(markReady, 1200);
    invalidateMapSize(map);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => invalidateMapSize(map));
    observer?.observe(map.getContainer());
    map.on("click", (event) => {
      if (suppressMapClickRef.current) {
        suppressMapClickRef.current = false;
        return;
      }
      const lat = event.latlng.lat;
      const lon = event.latlng.lng;
      const ctx = clickContextRef.current;
      const origin = ctx.userLocation || { lat: map.getCenter().lat, lon: map.getCenter().lng };
      const range = haversineKm(origin.lat, origin.lon, lat, lon) * 0.621371;
      const y = Math.sin((lon - origin.lon) * Math.PI / 180) * Math.cos(lat * Math.PI / 180);
      const x =
        Math.cos(origin.lat * Math.PI / 180) * Math.sin(lat * Math.PI / 180) -
        Math.sin(origin.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.cos((lon - origin.lon) * Math.PI / 180);
      const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
      setInspector({
        active: true,
        lat: lat.toFixed(3),
        lon: lon.toFixed(3),
        bearing: Math.round(bearing),
        range: range.toFixed(1),
      });
      setStormData({
        bearing,
        distanceMi: Number(range.toFixed(1)),
        speedMph: Math.round(ctx.windData?.speedMph || 25),
        etaMinutes: Math.max(1, Math.round((range / Math.max(ctx.windData?.speedMph || 25, 8)) * 60)),
      });
      ctx.onMapClick?.({ bearing, range, lat, lon });
    });
    return () => {
      window.clearTimeout(readyTimer);
      window.clearTimeout(errorTimer);
      observer?.disconnect();
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      if (locationErrorTimerRef.current) clearTimeout(locationErrorTimerRef.current);
      if (windFetchTimerRef.current) clearTimeout(windFetchTimerRef.current);
      [radarLayerRef, tornadoLayerRef, thunderLayerRef, floodLayerRef, winterLayerRef, userLocationMarkerRef].forEach((r) => {
        if (r.current && leafletMap.current?.hasLayer(r.current)) leafletMap.current.removeLayer(r.current);
        r.current = null;
      });
      baseLayerRef.current = null;
      setIsMapReady(false);
      if (leafletMap.current) {
        const mapInstance = leafletMap.current;
        leafletMap.current = null;
        mapInstance.remove();
      }
    };
  }, []);

  // Auto-center on user's GPS location when app loads
  useEffect(() => {
    if (!navigator.geolocation || initialLocationSet) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userLoc = { lat: latitude, lon: longitude };
        setUserLocation(userLoc);

        // Find nearest NEXRAD station
        const nearestStation = findNearestStation(latitude, longitude);
        setNearestSite(nearestStation);
        setLocationDenied(false);

        if (leafletMap.current && !initialLocationSet) {
          leafletMap.current.setView([latitude, longitude], 8);
          setInitialLocationSet(true);
        }
      },
      () => {
        setLocationDenied(true);
        setInitialLocationSet(true);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, [initialLocationSet]);

  useEffect(() => { alertTogglesRef.current = alertToggles; }, [alertToggles]);

  const radarProduct = settings.product || "reflectivity";
  const radarSite = resolveRadarSite(settings.station, radarProduct, nearestSite);
  const loopTiles = loopEnabled && radarProduct === "reflectivity" && !showGlobalRadar && loopFrames.length > 0;
  const frameSignature = loopTiles
    ? loopFrames.map((frame) => frame.tileUrl).join("|")
    : `${settings.station}:${radarProduct}:${showGlobalRadar ? "global" : "live"}`;

  useEffect(() => {
    if (!leafletMap.current || !isMapReady) return undefined;
    const map = leafletMap.current;
    frameLayersRef.current.forEach((layer) => {
      if (map.hasLayer(layer)) map.removeLayer(layer);
    });
    frameLayersRef.current = [];
    radarLayerRef.current = null;
    let radarErrorTimer = 0;
    if (!showNexrad) return undefined;

    if (loopTiles) {
      frameLayersRef.current = loopFrames.map((frame, index) => L.tileLayer(frame.tileUrl, {
        attribution: frame.extrapolated ? "Estimated from recent radar frames" : "Radar via RainViewer",
        opacity: index === loopIndex ? 0.8 : 0,
        minZoom: 4,
        maxZoom: 12,
        maxNativeZoom: 7,
        updateWhenIdle: false,
        updateWhenZooming: true,
        keepBuffer: 2,
        zIndex: 400,
        crossOrigin: "anonymous",
      }).addTo(map));
    } else {
      const liveGlobal = radarCatalog?.past?.[radarCatalog.past.length - 1];
      const tileUrl = showGlobalRadar && liveGlobal
        ? rainViewerLeafletUrl(liveGlobal)
        : productTileUrl(radarSite, radarProduct);
      const layer = L.tileLayer(tileUrl, {
        attribution: showGlobalRadar ? "Radar via RainViewer" : "NEXRAD via Iowa Environmental Mesonet",
        opacity: 0.82,
        minZoom: 4,
        maxZoom: 12,
        maxNativeZoom: showGlobalRadar || radarSite === NATIONAL_MOSAIC_ID ? 7 : 8,
        updateWhenIdle: false,
        updateWhenZooming: true,
        keepBuffer: 2,
        zIndex: 400,
        crossOrigin: "anonymous",
      }).addTo(map);
      let sawRadarTile = false;
      radarErrorTimer = window.setTimeout(() => {
        if (!sawRadarTile) setRadarTileError(true);
      }, 8000);
      layer.on("tileload", () => {
        sawRadarTile = true;
        window.clearTimeout(radarErrorTimer);
        setRadarTileError(false);
      });
      layer.on("remove", () => window.clearTimeout(radarErrorTimer));
      frameLayersRef.current = [layer];
      radarLayerRef.current = layer;
    }

    return () => {
      window.clearTimeout(radarErrorTimer);
      frameLayersRef.current.forEach((layer) => {
        if (leafletMap.current?.hasLayer(layer)) leafletMap.current.removeLayer(layer);
      });
      frameLayersRef.current = [];
      radarLayerRef.current = null;
    };
  }, [showNexrad, isMapReady, loopTiles, frameSignature, radarProduct, radarSite, showGlobalRadar, radarCatalog, radarRefresh]);

  useEffect(() => {
    if (!loopTiles) return undefined;
    frameLayersRef.current.forEach((layer, index) => {
      layer.setOpacity(index === loopIndex ? 0.8 : 0);
    });
    return undefined;
  }, [loopIndex, loopTiles]);

  useEffect(() => {
    if (!loopEnabled && !showGlobalRadar && !showFutureRadar) return undefined;
    let cancelled = false;
    fetch("https://api.rainviewer.com/public/weather-maps.json")
      .then((response) => response.json())
      .then((payload) => {
        if (cancelled) return;
        const host = payload.host || "https://tilecache.rainviewer.com";
        const past = (payload?.radar?.past || []).map((frame) => ({
          ...frame,
          host,
          kind: "past",
          tileUrl: `${host}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`,
        }));
        const nowcast = (payload?.radar?.nowcast || []).map((frame) => ({
          ...frame,
          host,
          kind: "future",
          tileUrl: `${host}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`,
        }));
        setRadarCatalog({ past, nowcast });
        const built = buildRadarLoop(past, nowcast, { includeFuture: showFutureRadar, maxFrames: loopFrameCount });
        loopFramesRef.current = built.frames;
        setLoopSource(built.source);
        setLoopFrames(built.frames);
        setLoopError(false);
        setLoopIndex(showFutureRadar ? Math.max(0, past.length - 1) : Math.max(0, built.frames.length - 1));
      })
      .catch(() => {
        if (!cancelled) setLoopError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [loopEnabled, showGlobalRadar, showFutureRadar, loopFrameCount, loopAttempt]);

  useEffect(() => {
    if (loopEnabled) return undefined;
    const timer = window.setInterval(() => setRadarRefresh((value) => value + 1), 5 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [loopEnabled]);

  useEffect(() => {
    if (!loopEnabled || !loopPlaying || loopFrames.length === 0) return undefined;
    const timer = window.setInterval(() => {
      setLoopIndex((current) => (current + 1) % loopFrames.length);
    }, loopSpeed);
    return () => window.clearInterval(timer);
  }, [loopEnabled, loopPlaying, loopSpeed, loopFrames.length]);

  useEffect(() => {
    if (!leafletMap.current || !isMapReady) return undefined;
    if (precipLayerRef.current) {
      leafletMap.current.removeLayer(precipLayerRef.current);
      precipLayerRef.current = null;
    }
    if (!showPrecip) return undefined;
    precipLayerRef.current = L.tileLayer(
      "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/q2-p24h/{z}/{x}/{y}.png",
      { opacity: 0.65, maxZoom: 8, zIndex: 260, attribution: "MRMS 24-hour precipitation via Iowa Mesonet" }
    ).addTo(leafletMap.current);
    return () => {
      if (precipLayerRef.current && leafletMap.current) {
        leafletMap.current.removeLayer(precipLayerRef.current);
        precipLayerRef.current = null;
      }
    };
  }, [showPrecip, isMapReady]);

  useEffect(() => {
    if (!isMapReady) return undefined;
    let cancelled = false;
    const loadAlerts = () => {
      fetch("/api/alerts?type=all")
        .then((response) => {
          if (!response.ok) throw new Error("Alerts unavailable");
          return response.json();
        })
        .then((data) => {
          if (cancelled) return;
          if (data?.error && !(data.features || []).length) throw new Error(data.error);
          const next = Array.isArray(data?.features) ? data : { features: [] };
          writeCachedJson("ynk-alerts-v1", next);
          setAlertCollection(next);
          setAlertsError(false);
          setAlertsStale(false);
        })
        .catch(() => {
          if (cancelled) return;
          const cached = readCachedJson("ynk-alerts-v1");
          if (cached?.features) {
            setAlertCollection(cached);
            setAlertsStale(true);
          }
          setAlertsError(true);
        });
    };
    loadAlerts();
    refreshTimerRef.current = setInterval(loadAlerts, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(refreshTimerRef.current);
    };
  }, [isMapReady, alertAttempt]);

  useEffect(() => {
    if (!leafletMap.current || !isMapReady) {
      setActiveTornadoWarning(false);
      setActiveTornadoWatch(false);
      return undefined;
    }

    const features = alertCollection?.features || [];
    const grouped = new Map();
    features.forEach((feature) => {
      const layer = feature?.properties?.ynkLayer;
      if (!layer) return;
      const bucket = grouped.get(layer) || [];
      bucket.push(feature);
      grouped.set(layer, bucket);
    });

    const tornadoWarnings = grouped.get("tornado") || [];
    const tornadoWatches = grouped.get("tornado_watch") || [];
    setActiveTornadoWarning(
      Boolean(userLocation) && tornadoWarnings.some((feature) => isFeatureNearLocation(feature, userLocation, 150))
    );
    setActiveTornadoWatch(
      Boolean(userLocation) && tornadoWatches.some((feature) => isFeatureNearLocation(feature, userLocation, 150))
    );
    setWarningCount(features.filter((feature) => /warning/i.test(feature?.properties?.event || "")).length);

    const paint = (layerRef, layerKey, enabled) => {
      if (layerRef.current) {
        leafletMap.current.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      if (!enabled || !leafletMap.current) return;
      const layerFeatures = grouped.get(layerKey) || [];
      if (!layerFeatures.length) return;
      const color = ALERT_LAYER_COLORS[layerKey];
      layerRef.current = L.geoJSON(
        { type: "FeatureCollection", features: layerFeatures },
        {
          style: { color, weight: 2, opacity: 0.95, fillColor: color, fillOpacity: 0.18 },
          onEachFeature: (feature, layer) => {
            layer.on("click", (event) => {
              suppressMapClickRef.current = true;
              if (event.originalEvent) L.DomEvent.stopPropagation(event.originalEvent);
              setSelectedAlert(alertSummary(feature));
              setAlertSheet("detail");
            });
          },
        }
      ).addTo(leafletMap.current);
    };

    paint(tornadoLayerRef, "tornado", showTornado);
    paint(tornadoWatchLayerRef, "tornado_watch", showTornadoWatch);
    paint(severeWatchLayerRef, "severe_watch", showSevereWatch);
    paint(thunderLayerRef, "severe", showThunderstorm);
    paint(floodLayerRef, "flood", showFlood);
    paint(winterLayerRef, "winter", showWinter);
    paint(heatLayerRef, "heat", showHeat);
    paint(windLayerRef, "wind", showWind);
    paint(fireWxLayerRef, "fire", showFireWx);

    return () => {
      [tornadoLayerRef, tornadoWatchLayerRef, severeWatchLayerRef, thunderLayerRef, floodLayerRef, winterLayerRef, heatLayerRef, windLayerRef, fireWxLayerRef].forEach((layerRef) => {
        if (layerRef.current && leafletMap.current?.hasLayer(layerRef.current)) leafletMap.current.removeLayer(layerRef.current);
        layerRef.current = null;
      });
    };
  }, [alertCollection, showTornado, showTornadoWatch, showSevereWatch, showThunderstorm, showFlood, showWinter, showHeat, showWind, showFireWx, userLocation, isMapReady]);

  const handleConusView = () => {
    if (!leafletMap.current) return;
    leafletMap.current.setView([39.5, -98.35], 5);
  };

  const refreshWeatherData = async () => {
    setRadarRefresh((value) => value + 1);
  };
  const { isRefreshing, pullToRefreshHandlers } = usePullToRefresh({ onRefresh: refreshWeatherData });
  const showLocationError = (msg) => {
    if (locationErrorTimerRef.current) clearTimeout(locationErrorTimerRef.current);
    setLocationError(msg);
    locationErrorTimerRef.current = setTimeout(() => setLocationError(null), 4000);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationDenied(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocationDenied(false);
        setUserLocation({ lat: latitude, lon: longitude });
        leafletMap.current?.setView([latitude, longitude], 8);
        if (userLocationMarkerRef.current && leafletMap.current) leafletMap.current.removeLayer(userLocationMarkerRef.current);
        if (leafletMap.current) {
          userLocationMarkerRef.current = L.marker([latitude, longitude]).addTo(leafletMap.current);
        }
      },
      () => setLocationDenied(true)
    );
  };

  const chooseSearchedPlace = (place) => {
    if (place?.latitude == null || place?.longitude == null) return;
    saveActiveLocation(place);
    setUserLocation({ lat: place.latitude, lon: place.longitude });
    setLocationDenied(false);
    leafletMap.current?.setView([place.latitude, place.longitude], 8);
  };

  const retryMapTiles = () => {
    setBaseMapError(false);
    setRadarTileError(false);
    baseLayerRef.current?.redraw();
    setRadarRefresh((value) => value + 1);
  };

  const handleShowNexradChange = (value) => onSettingsChange({ ...settings, showNexrad: value });
  const handleAlertToggleChange = (key, value) => {
    const stored = {
      tornado: "alertTornado",
      severe: "alertSevere",
      flood: "alertFlood",
      winter: "alertWinter",
      heat: "alertHeat",
      wind: "alertWind",
      fire: "alertFire",
    };
    if (key === "tornado") setShowTornado(value);
    if (key === "severe") setShowThunderstorm(value);
    if (key === "flood") setShowFlood(value);
    if (key === "winter") setShowWinter(value);
    if (key === "heat") setShowHeat(value);
    if (key === "wind") setShowWind(value);
    if (key === "fire") setShowFireWx(value);
    if (stored[key]) saveRadarLayers({ [stored[key]]: value });
  };

  const handleLayersMenuToggle = () => {
    setIsLayersMenuOpen((prev) => !prev);
  };

  const alertsActive = showTornado || showThunderstorm || showFlood || showWinter;

  const sendSafety = async (kind) => {
    if (!loadShelterContacts().length) {
      navigate("/Contacts");
      return;
    }
    try {
      await sendContactTexts({
        kind,
        coords: userLocation
          ? { latitude: userLocation.lat, longitude: userLocation.lon }
          : savedPlace
            ? { latitude: savedPlace.latitude, longitude: savedPlace.longitude }
            : undefined,
      });
    } catch (error) {
      if (error.code === "NO_CONTACTS") {
        navigate("/Contacts");
        return;
      }
      showLocationError(error.message);
    }
  };

  const handleChipClick = (id) => {
    const feature = getMapFeature(id);
    if (!feature) return;

    if (feature.kind === "layer") {
      if (id === "radar") handleShowNexradChange(!showNexrad);
      if (id === "lightning") setShowLightning((value) => !value);
      if (id === "satellite") setShowSatellite((value) => !value);
      if (id === "hurricanes") setShowHurricanes((value) => !value);
      if (id === "fires") setShowFires((value) => !value);
      if (id === "alerts") {
        const next = !alertsActive;
        setShowTornado(next);
        setShowThunderstorm(next);
        setShowFlood(next);
        setShowWinter(next);
      }
      if (id === "tornado") setShowTornado((value) => !value);
      if (id === "severe") setShowThunderstorm((value) => !value);
      if (id === "flood") setShowFlood((value) => !value);
      if (id === "winter") setShowWinter((value) => !value);
      return;
    }

    if (feature.kind === "route" && feature.path) {
      navigate(feature.path);
      return;
    }

    if (id === "loop") {
      setLoopEnabled((value) => {
        const next = !value;
        setLoopPlaying(next);
        return next;
      });
      return;
    }

    if (id === "help" || id === "safe") {
      if (!showSafetyTexts) return;
      sendSafety(id === "help" ? "emergency" : "safe");
    }
  };

  useEffect(() => {
    if (!leafletMap.current || !isMapReady) return undefined;
    if (settings.station === NATIONAL_MOSAIC_ID) return undefined;
    const coords = STATION_COORDS[settings.station];
    if (!coords || stationPanRef.current === settings.station) return undefined;
    stationPanRef.current = settings.station;
    const zoom = Math.max(leafletMap.current.getZoom(), 7);
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduceMotion) leafletMap.current.setView(coords, zoom);
    else leafletMap.current.flyTo(coords, zoom, { duration: 0.45 });
    return undefined;
  }, [settings.station, isMapReady]);

  useEffect(() => {
    let cancelled = false;
    const loadAge = () => {
      latestProductScanUnix(settings.station, radarProduct)
        .then((time) => {
          if (!cancelled) setProductScanUnix(time);
        })
        .catch(() => {
          if (!cancelled) setProductScanUnix(null);
        });
    };
    loadAge();
    const timer = window.setInterval(loadAge, 60000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [settings.station, radarProduct, radarRefresh]);

  useEffect(() => {
    const live = Array.isArray(pointAlertsQuery.data) ? pointAlertsQuery.data : [];
    const active = activeSafetyAlerts(safetyPreview ? [safetyPreview, ...live] : live);
    if (!active.length) return;
    hapticSevereWarning(active.map((alert) => alert.id || alert.name).join("|"));
  }, [pointAlertsQuery.data, safetyPreview]);

  const warningList = useMemo(
    () => warningFeatures(alertCollection).map(alertSummary),
    [alertCollection]
  );
  const frameTime = loopEnabled && loopFrames[loopIndex]?.time ? loopFrames[loopIndex].time : null;
  const shownFrameTime = frameTime || productScanUnix;
  const frameClock = frameTime
    ? `${loopFrames[loopIndex].extrapolated ? "Estimated " : loopFrames[loopIndex].kind === "future" ? "Future " : ""}${new Date(frameTime * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
    : "Now";
  const playbackLabel = loopEnabled && loopPlaying ? "Looping" : "Live";
  const productCaption = settings.station === NATIONAL_MOSAIC_ID && radarProduct === "reflectivity"
    ? ridgeProductLabel(NATIONAL_MOSAIC_ID, radarProduct)
    : ridgeProductLabel(radarSite, radarProduct);
  const toggleSheet = (key) => {
    const flip = (current, setter, saved) => {
      const next = !current;
      setter(next);
      if (saved) saveRadarLayers(saved(next));
    };
    if (key === "wind") flip(showWindField, setShowWindField, (next) => ({ wind: next }));
    if (key === "precip") flip(showPrecip, setShowPrecip, (next) => ({ precip: next }));
    if (key === "stormReports") flip(showLightning, setShowLightning, (next) => ({ lightning: next }));
    if (key === "cells") flip(showCells, setShowCells, (next) => ({ cells: next }));
    if (key === "hurricanes") flip(showHurricanes, setShowHurricanes, (next) => ({ storms: next }));
    if (key === "fires") flip(showFires, setShowFires, (next) => ({ fires: next }));
    if (key === "perimeters") flip(showPerimeters, setShowPerimeters);
    if (key === "snow") flip(showSnow, setShowSnow);
    if (key === "air") flip(showAir, setShowAir);
    if (key === "quakes") flip(showQuakes, setShowQuakes);
    if (key === "fronts") flip(showFronts, setShowFronts);
    if (key === "spc1") flip(showSpc1, setShowSpc1);
    if (key === "spc2") flip(showSpc2, setShowSpc2);
    if (key === "spc3") flip(showSpc3, setShowSpc3);
    if (key === "md") flip(showMd, setShowMd);
    if (key === "tornadoWatch") flip(showTornadoWatch, setShowTornadoWatch);
    if (key === "severeWatch") flip(showSevereWatch, setShowSevereWatch);
    if (key === "tornado") handleAlertToggleChange("tornado", !showTornado);
    if (key === "severe") handleAlertToggleChange("severe", !showThunderstorm);
    if (key === "flood") handleAlertToggleChange("flood", !showFlood);
    if (key === "winter") handleAlertToggleChange("winter", !showWinter);
    if (key === "heat") handleAlertToggleChange("heat", !showHeat);
    if (key === "windAlert") handleAlertToggleChange("wind", !showWind);
    if (key === "fireWx") handleAlertToggleChange("fire", !showFireWx);
  };

  return (
    <div className="relative h-full min-h-[400px] w-full select-none overscroll-none" {...pullToRefreshHandlers}>
      {!isMapReady && (
        <div className="absolute inset-0 z-[900] flex items-center justify-center bg-slate-950">
          <div className="flex flex-col items-center gap-3 text-white/80">
            <div className="h-10 w-10 rounded-full border-4 border-white/15 border-t-white/80 animate-spin"></div>
            <div className="text-xs font-medium tracking-[0.2em] text-white/60 uppercase">Loading Radar</div>
          </div>
        </div>
      )}
      {isRefreshing && (
        <div className="absolute left-1/2 z-[1200] -translate-x-1/2 rounded-full bg-slate-900/85 px-4 py-2 text-xs font-medium text-white shadow-lg backdrop-blur-sm" style={{ top: "calc(1rem + env(safe-area-inset-top))" }}>
          Refreshing radar...
        </div>
      )}
      {variant !== "clean" && <RadarLayersMenu
        isOpen={isLayersMenuOpen}
        onToggle={handleLayersMenuToggle}
        showNexrad={showNexrad}
        showRadio={showRadio}
        showLightning={showLightning}
        showHurricanes={showHurricanes}
        showSatellite={showSatellite}
        showGlobalRadar={showGlobalRadar}
        showFutureRadar={showFutureRadar}
        showFires={showFires}
        alertToggles={alertToggles}
        onShowNexradChange={handleShowNexradChange}
        onShowRadioChange={onToggleRadio}
        onShowLightningChange={setShowLightning}
        onShowHurricanesChange={setShowHurricanes}
        onShowSatelliteChange={setShowSatellite}
        onShowGlobalRadarChange={setShowGlobalRadar}
        onShowFutureRadarChange={(value) => {
          setShowFutureRadar(value);
          if (value) {
            setLoopEnabled(true);
            setLoopPlaying(true);
          }
        }}
        onShowFiresChange={setShowFires}
        productId={radarProduct}
        onProductChange={(id) => onSettingsChange?.({ ...settings, product: id })}
        onAlertToggleChange={handleAlertToggleChange}
        dockIds={dockIds}
        onTogglePin={togglePin}
        onMovePin={move}
        onResetDock={reset}
        onFeatureAction={handleChipClick}
        showSafetyActions={showSafetyTexts}
      />}
      <ExtraMapLayers
        map={leafletMap.current}
        ready={isMapReady}
        satelliteMode={satelliteMode}
        surfaceField={surfaceField}
        overlays={{
          spc1: showSpc1,
          spc2: showSpc2,
          spc3: showSpc3,
          md: showMd,
          fronts: showFronts,
          quakes: showQuakes,
          perimeters: showPerimeters,
          snow: showSnow,
          air: showAir,
        }}
      />
      <LightningLayer map={leafletMap.current} enabled={showLightning && isMapReady} />
      <HurricaneLayer map={leafletMap.current} enabled={showHurricanes && isMapReady} />
      <StormCellLayer map={leafletMap.current} enabled={showCells && isMapReady} />
      <WindFieldLayer map={leafletMap.current} enabled={showWindField && isMapReady} />
      <WildfireLayer map={leafletMap.current} enabled={showFires && isMapReady} />
      {variant === "clean" && (
        <>
          <div
            className="pointer-events-none absolute left-3 z-[1000] flex max-w-[calc(100%-6.75rem)] flex-col items-start gap-2"
            style={{ top: "calc(0.75rem + env(safe-area-inset-top))" }}
          >
            <RadarFrameStatus
              productCaption={productCaption}
              frameClock={frameClock}
              playbackLabel={playbackLabel}
              frameTime={shownFrameTime}
              warningCount={warningList.length || warningCount}
              onOpenAlerts={() => setAlertSheet("list")}
            />
            <RainArrivalAlert />
            {showSafetyTexts && (
              <div className="pointer-events-auto w-full max-w-sm">
                <SafetyTextActions
                  compact
                  coords={
                    userLocation
                      ? { latitude: userLocation.lat, longitude: userLocation.lon }
                      : savedPlace
                        ? { latitude: savedPlace.latitude, longitude: savedPlace.longitude }
                        : null
                  }
                />
              </div>
            )}
            {locationDenied && (
              <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-white/10 bg-slate-950/95 p-3 shadow-xl">
                <p className="text-xs leading-relaxed text-slate-200">
                  Location is off. Search for a city, or allow location while using the app.
                </p>
                <div className="mt-2">
                  <LocationSearch current={savedPlace} onSelect={chooseSearchedPlace} />
                </div>
                <button type="button" onClick={handleLocateMe} className="mt-2 text-xs font-semibold text-sky-300">
                  Try location again
                </button>
              </div>
            )}
            {(baseMapError || radarTileError) && (
              <div className="pointer-events-auto rounded-2xl border border-white/10 bg-slate-950/95 px-3 py-2 text-xs text-slate-100 shadow">
                <p>{baseMapError ? "Map tiles didn't load." : "Radar tiles didn't load."}</p>
                <button type="button" onClick={retryMapTiles} className="mt-2 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-slate-950">
                  Retry
                </button>
              </div>
            )}
            {alertsStale && !alertSheet && (
              <p className="pointer-events-auto rounded-full bg-amber-950/90 px-3 py-1.5 text-[11px] text-amber-100">
                Showing the last alerts saved on this device.
              </p>
            )}
            {alertsError && warningList.length === 0 && (
              <button
                type="button"
                onClick={() => setAlertAttempt((value) => value + 1)}
                className="pointer-events-auto rounded-full bg-slate-950/95 px-3 py-1.5 text-[11px] font-semibold text-white"
              >
                Alerts didn&apos;t load. Retry
              </button>
            )}
          </div>
          <div
            className="pointer-events-none absolute inset-x-0 z-[1100] flex items-start justify-end px-3"
            style={{ top: "calc(0.75rem + env(safe-area-inset-top))" }}
          >
            <button
              type="button"
              onClick={() => setIsLayersMenuOpen((value) => !value)}
              aria-expanded={isLayersMenuOpen}
              aria-label={isLayersMenuOpen ? "Close layers" : "Open layers"}
              className="pointer-events-auto flex h-11 items-center gap-2 rounded-full bg-slate-950/90 px-4 text-sm font-semibold text-white shadow"
            >
              <Layers className="h-4 w-4" aria-hidden="true" />
              Layers
            </button>
          </div>
          {isLayersMenuOpen && (
            <LayerSheet
              stations={[NATIONAL_MOSAIC_ID, ...Object.keys(STATION_COORDS).sort()]}
              station={settings.station}
              onStationChange={(site) => onSettingsChange?.({ ...settings, station: site })}
              productId={radarProduct}
              onProductChange={(id) => onSettingsChange?.({ ...settings, product: id, showNexrad: true })}
              radarOn={showNexrad}
              onRadarChange={(next) => {
                handleShowNexradChange(next);
                saveRadarLayers({ radar: next });
              }}
              futureOn={showFutureRadar}
              onFutureChange={(next) => {
                setShowFutureRadar(next);
                if (next) {
                  setLoopEnabled(true);
                  setLoopPlaying(true);
                }
              }}
              satelliteMode={satelliteMode}
              onSatelliteMode={(mode) => {
                setSatelliteMode(mode);
                saveRadarLayers({ satelliteMode: mode });
              }}
              surfaceField={surfaceField}
              onSurfaceField={setSurfaceField}
              productCaption={loopSource === "extrapolated-recent-frames" && showFutureRadar ? `${productCaption} · future is estimated` : productCaption}
              toggles={{
                wind: showWindField,
                precip: showPrecip,
                stormReports: showLightning,
                cells: showCells,
                hurricanes: showHurricanes,
                fires: showFires,
                perimeters: showPerimeters,
                snow: showSnow,
                air: showAir,
                quakes: showQuakes,
                fronts: showFronts,
                spc1: showSpc1,
                spc2: showSpc2,
                spc3: showSpc3,
                md: showMd,
                tornadoWatch: showTornadoWatch,
                severeWatch: showSevereWatch,
                tornado: showTornado,
                severe: showThunderstorm,
                flood: showFlood,
                winter: showWinter,
                heat: showHeat,
                windAlert: showWind,
                fireWx: showFireWx,
              }}
              onToggle={toggleSheet}
            />
          )}
          {locationError && (
            <div className="pointer-events-none absolute inset-x-3 top-16 z-[1090]">
              <div className="pointer-events-auto max-w-xs rounded-xl bg-slate-950/95 px-3 py-2 text-xs text-white shadow">
                {locationError}
              </div>
            </div>
          )}
          {alertSheet && (
            <RadarAlertSheet
              mode={alertSheet}
              warnings={warningList}
              selected={selectedAlert}
              stale={alertsStale}
              error={alertsError && warningList.length === 0}
              onClose={() => setAlertSheet(null)}
              onOpenList={() => setAlertSheet("list")}
              onSelect={(summary) => {
                setSelectedAlert(summary);
                setAlertSheet("detail");
              }}
              onRetry={() => setAlertAttempt((value) => value + 1)}
            />
          )}
          <div
            className="pointer-events-none absolute inset-x-3 z-[1100] flex items-end justify-between gap-2"
            style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
          >
            <TimeLapseBar
              enabled={loopEnabled}
              playing={loopPlaying}
              frameLabel={
                loopEnabled && loopFrames[loopIndex]?.time
                  ? `${loopFrames[loopIndex].kind === "future" ? "Future " : ""}${new Date(loopFrames[loopIndex].time * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
                  : "Live"
              }
              speed={loopSpeed}
              frameCount={loopFrameCount}
              onFrameCountChange={setLoopFrameCount}
              onRetry={loopEnabled && loopError ? () => setLoopAttempt((value) => value + 1) : undefined}
              onToggleEnabled={() => {
                setLoopEnabled((value) => {
                  const next = !value;
                  setLoopPlaying(next);
                  return next;
                });
              }}
              onTogglePlaying={() => setLoopPlaying((value) => !value)}
              onSpeedChange={setLoopSpeed}
            />
            <button
              type="button"
              onClick={handleLocateMe}
              className="pointer-events-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-500 text-slate-950 shadow-md"
              aria-label="Center radar on my location"
            >
              <LocateFixed size={20} aria-hidden="true" />
            </button>
          </div>
        </>
      )}
      {variant !== "clean" && <WindSpeedDisplay windData={windData} />}
      {variant !== "clean" && <ProLegend productLabel={getRadarProduct(radarProduct).label} />}
      {variant !== "clean" && <RadarStatusBar
        productLabel={getRadarProduct(radarProduct).label}
        isLooping={loopEnabled && loopPlaying}
        frameLabel={
          loopEnabled && loopFrames[loopIndex]?.time
            ? `${loopFrames[loopIndex].kind === "future" ? "Future " : ""}${new Date(loopFrames[loopIndex].time * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
            : showGlobalRadar
              ? "Global"
              : "Live"
        }
        warnings={activeWarningsCount}
      />}
      {variant !== "clean" && <div className="pointer-events-none absolute inset-x-0 bottom-3 z-[1200] flex flex-col items-center gap-2 px-3">
        <ShelterAlert activeTornadoWarning={activeTornadoWarning} activeTornadoWatch={activeTornadoWatch} />
        {stormData && (
          <StormToolsPanel stormData={stormData} onClose={() => setStormData(null)} />
        )}
        {inspector?.active && <RadarInspectorPanel inspector={inspector} productLabel={getRadarProduct(radarProduct).label} />}
        <RadarQuickActions
          show={showTools}
          onConus={handleConusView}
          onToggleLayers={handleLayersMenuToggle}
          onClose={onToolsToggle}
          extra={
            <>
              <RadarDataDock
                metrics={
                  mapCenter
                    ? {
                        latitude: Math.abs(mapCenter.lat).toFixed(2),
                        latHemisphere: mapCenter.lat >= 0 ? "N" : "S",
                        longitude: Math.abs(mapCenter.lng).toFixed(2),
                        lonHemisphere: mapCenter.lng >= 0 ? "E" : "W",
                        zoom: leafletMap.current?.getZoom?.() ?? "—",
                        warnings: activeWarningsCount,
                      }
                    : null
                }
                productLabel={getRadarProduct(radarProduct).label}
                station={settings.station}
              />
              <TargetList
                targets={targets}
                settings={settings}
                onTargetClick={onTargetClick}
                onDeleteTarget={onDeleteTarget}
              />
            </>
          }
        />
        <RadarPlaybackDock
          dockIds={dockIds}
          layers={{
            radar: showNexrad,
            lightning: showLightning,
            satellite: showSatellite,
            hurricanes: showHurricanes,
            fires: showFires,
            alerts: alertsActive,
            tornado: showTornado,
            severe: showThunderstorm,
            flood: showFlood,
            winter: showWinter,
            loop: loopEnabled,
          }}
          onChipClick={handleChipClick}
          onOpenMore={handleLayersMenuToggle}
          onTogglePin={togglePin}
          onResetDock={reset}
          showSafetyActions={showSafetyTexts}
        />
        <div className="flex w-full max-w-md items-end justify-between gap-2">
          <TimeLapseBar
            enabled={loopEnabled}
            playing={loopPlaying}
            frameLabel={
              loopEnabled && loopFrames[loopIndex]?.time
                ? `${loopFrames[loopIndex].kind === "future" ? "Future " : ""}${new Date(loopFrames[loopIndex].time * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
                : showGlobalRadar
                  ? "Global"
                  : "Live"
            }
            speed={loopSpeed}
            frameCount={loopFrameCount}
            onFrameCountChange={setLoopFrameCount}
            onRetry={loopEnabled && loopError ? () => setLoopAttempt((value) => value + 1) : undefined}
            onToggleEnabled={() => {
              setLoopEnabled((value) => {
                const next = !value;
                setLoopPlaying(next);
                return next;
              });
            }}
            onTogglePlaying={() => setLoopPlaying((value) => !value)}
            onSpeedChange={setLoopSpeed}
          />
          <button
            type="button"
            onClick={handleLocateMe}
            className="pointer-events-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600/80 text-white shadow-md"
            aria-label="Center radar on my location"
          >
            <LocateFixed size={18} aria-hidden="true" />
          </button>
        </div>
        {locationError && (
          <div className="pointer-events-auto rounded-xl bg-red-900/90 px-3 py-1.5 text-xs font-medium text-red-200">
            {locationError}
          </div>
        )}
      </div>}
      <div ref={mapRef} className="radar-stage absolute inset-0 h-full min-h-[400px] w-full" role="application" aria-label="Interactive weather radar" />
      {variant !== "clean" && (
        <div className="pointer-events-none absolute bottom-1 left-3 z-[999] text-[11px] font-semibold tracking-wide text-white/30">
          YouNeeK Pro Radar — by Andrew Gray
        </div>
      )}
    </div>
  );
}
