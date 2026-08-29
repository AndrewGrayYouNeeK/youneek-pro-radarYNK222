import { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import { LocateFixed } from "lucide-react";
import RadarLayersMenu from "./RadarLayersMenu";
import ShelterAlert from "./ShelterAlert";
import RadarQuickActions from "./RadarQuickActions";
import WindSpeedDisplay from "./WindSpeedDisplay";
import TimeLapseBar from "./TimeLapseBar";
import LightningLayer from "./LightningLayer";
import HurricaneLayer from "./HurricaneLayer";
import ProLegend from "./ProLegend";
import RadarDataDock from "./RadarDataDock";
import RadarInspectorPanel from "./RadarInspectorPanel";
import RadarStatusBar from "./RadarStatusBar";
import StormToolsPanel from "./StormToolsPanel";
import TargetList from "./TargetList";
import { getRadarProduct } from "./radarProducts";
import usePullToRefresh from "@/hooks/usePullToRefresh";
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

const getAlertUrl = (type) => `/api/alerts?type=${type}`;

const AERIS_CLIENT_ID = import.meta.env.VITE_AERIS_CLIENT_ID;
const AERIS_CLIENT_SECRET = import.meta.env.VITE_AERIS_CLIENT_SECRET;
const WIND_FETCH_DEBOUNCE_MS = 800;

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

const ACTIVE_PRODUCT = getRadarProduct("reflectivity");

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
}) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const radarLayerRef = useRef(null);
  const tornadoLayerRef = useRef(null);
  const thunderLayerRef = useRef(null);
  const floodLayerRef = useRef(null);
  const winterLayerRef = useRef(null);
  const satelliteLayerRef = useRef(null);
  const loopFramesRef = useRef([]);
  const refreshTimerRef = useRef(null);
  const userLocationMarkerRef = useRef(null);

  const [showTornado, setShowTornado] = useState(true);
  const [showThunderstorm, setShowThunderstorm] = useState(true);
  const [showFlood, setShowFlood] = useState(false);
  const [showWinter, setShowWinter] = useState(false);
  const [showLightning, setShowLightning] = useState(true);
  const [showHurricanes, setShowHurricanes] = useState(true);
  const [showSatellite, setShowSatellite] = useState(false);
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [loopPlaying, setLoopPlaying] = useState(false);
  const [loopSpeed, setLoopSpeed] = useState(400);
  const [loopIndex, setLoopIndex] = useState(0);
  const [loopFrames, setLoopFrames] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [activeTornadoWarning, setActiveTornadoWarning] = useState(false);
  const [activeTornadoWatch, setActiveTornadoWatch] = useState(false);
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

  useEffect(() => {
    clickContextRef.current = { userLocation, windData, onMapClick };
  }, [userLocation, windData, onMapClick]);

  const mapCenter = leafletMap.current?.getCenter();
  const activeWarningsCount = [showTornado, showThunderstorm, showFlood, showWinter].filter(Boolean).length;

  const alertToggles = { tornado: showTornado, severe: showThunderstorm, flood: showFlood, winter: showWinter };
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
    if (leafletMap.current || !mapRef.current) return;
    const coords = STATION_COORDS[settings.station] || [39.5, -98.35]; // US center fallback
    leafletMap.current = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: true,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      touchZoom: true,
      bounceAtZoomLimits: false,
      minZoom: 4,
      maxZoom: 12,
    }).setView(coords, 7);
    const baseLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: "abcd", maxZoom: 20, crossOrigin: "anonymous"
    }).addTo(leafletMap.current);
    baseLayer.once("load", () => {
      setIsMapReady(true);
      invalidateMapSize(leafletMap.current);
    });
    leafletMap.current.on("click", (event) => {
      const lat = event.latlng.lat;
      const lon = event.latlng.lng;
      const ctx = clickContextRef.current;
      const origin = ctx.userLocation || { lat: leafletMap.current.getCenter().lat, lon: leafletMap.current.getCenter().lng };
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
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      if (locationErrorTimerRef.current) clearTimeout(locationErrorTimerRef.current);
      if (windFetchTimerRef.current) clearTimeout(windFetchTimerRef.current);
      [radarLayerRef, tornadoLayerRef, thunderLayerRef, floodLayerRef, winterLayerRef, userLocationMarkerRef].forEach((r) => {
        if (r.current && leafletMap.current?.hasLayer(r.current)) leafletMap.current.removeLayer(r.current);
        r.current = null;
      });
      setIsMapReady(false);
      if (leafletMap.current) {
        const mapInstance = leafletMap.current;
        leafletMap.current = null;
        mapInstance.remove();
      }
    };
  }, [settings.station]);

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

        // Update settings with nearest station
        if (onSettingsChange && nearestStation !== settings.station) {
          onSettingsChange({ ...settings, station: nearestStation });
        }

        // Center map on user's location with good zoom level
        if (leafletMap.current && !initialLocationSet) {
          leafletMap.current.setView([latitude, longitude], 8);
          setInitialLocationSet(true);
        }
      },
      (error) => {
        console.warn('Could not get initial location:', error);
        setInitialLocationSet(true);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, [initialLocationSet, settings, onSettingsChange]);

  useEffect(() => { alertTogglesRef.current = alertToggles; }, [alertToggles]);

  // Load NEXRAD reflectivity (live or RainViewer loop frames)
  useEffect(() => {
    if (!leafletMap.current || !isMapReady) return undefined;

    if (!showNexrad) {
      if (radarLayerRef.current) {
        leafletMap.current.removeLayer(radarLayerRef.current);
        radarLayerRef.current = null;
      }
      return undefined;
    }

    let tileUrl = "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-N0Q-0/{z}/{x}/{y}.png";
    if (loopEnabled && loopFrames[loopIndex]?.tileUrl) {
      tileUrl = loopFrames[loopIndex].tileUrl;
    }

    if (radarLayerRef.current) {
      leafletMap.current.removeLayer(radarLayerRef.current);
      radarLayerRef.current = null;
    }

    radarLayerRef.current = L.tileLayer(tileUrl, {
      attribution: loopEnabled ? "Radar loop via RainViewer" : "NEXRAD data from Iowa Environmental Mesonet",
      opacity: ACTIVE_PRODUCT.opacity,
      minZoom: 4,
      maxZoom: 12,
      maxNativeZoom: 12,
      crossOrigin: "anonymous",
    }).addTo(leafletMap.current);

    return () => {
      if (radarLayerRef.current && leafletMap.current) {
        leafletMap.current.removeLayer(radarLayerRef.current);
        radarLayerRef.current = null;
      }
    };
  }, [showNexrad, isMapReady, loopEnabled, loopIndex, loopFrames]);

  useEffect(() => {
    if (!loopEnabled) return undefined;
    let cancelled = false;
    fetch("https://api.rainviewer.com/public/weather-maps.json")
      .then((response) => response.json())
      .then((payload) => {
        if (cancelled) return;
        const host = payload.host || "https://tilecache.rainviewer.com";
        const past = payload?.radar?.past || [];
        const nowcast = payload?.radar?.nowcast || [];
        const frames = [...past, ...nowcast].map((frame) => ({
          time: frame.time,
          tileUrl: `${host}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`,
        }));
        loopFramesRef.current = frames;
        setLoopFrames(frames);
        setLoopIndex(Math.max(0, past.length - 1));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
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
    if (satelliteLayerRef.current) {
      leafletMap.current.removeLayer(satelliteLayerRef.current);
      satelliteLayerRef.current = null;
    }
    if (!showSatellite) return undefined;
    satelliteLayerRef.current = L.tileLayer(
      "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/goes_east_vis_1km/{z}/{x}/{y}.png",
      { opacity: 0.55, maxZoom: 10, attribution: "GOES East via Iowa Mesonet" }
    ).addTo(leafletMap.current);
    return () => {
      if (satelliteLayerRef.current && leafletMap.current) {
        leafletMap.current.removeLayer(satelliteLayerRef.current);
        satelliteLayerRef.current = null;
      }
    };
  }, [showSatellite, isMapReady]);

  // Separate effect for alerts (unchanged logic)
  useEffect(() => {
    if (!leafletMap.current || !showNexrad || !isMapReady) {
      setActiveTornadoWarning(false);
      setActiveTornadoWatch(false);
      return;
    }

    // Clean up existing alert layers
    [tornadoLayerRef, thunderLayerRef, floodLayerRef, winterLayerRef].forEach((r) => {
      if (r.current) { leafletMap.current.removeLayer(r.current); r.current = null; }
    });
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);

    const refreshAlertLayer = (layerRef, toggleKey, alertType, color) => {
      if (layerRef.current) { leafletMap.current.removeLayer(layerRef.current); layerRef.current = null; }
      if (!leafletMap.current || !showNexrad) return;
      fetch(getAlertUrl(alertType))
        .then((r) => r.json())
        .then((data) => {
          if (!leafletMap.current) return;
          if (toggleKey === "tornado") {
            const features = data?.features || [];
            // Only consider features with event "Tornado Warning" (not "Tornado Watch")
            const tornadoWarnings = features.filter((f) => {
              const event = f?.properties?.event || '';
              return event === 'Tornado Warning';
            });
            setActiveTornadoWarning(
              Boolean(userLocation) &&
              tornadoWarnings.some((f) => isFeatureNearLocation(f, userLocation, 150))
            );
          }
          if (!alertTogglesRef.current[toggleKey]) return;
          layerRef.current = L.geoJSON(data, {
            style: { color, weight: 2, opacity: 0.95, fillColor: color, fillOpacity: 0.18 }
          }).addTo(leafletMap.current);
        });
    };

    const refreshAlertLayers = () => {
      refreshAlertLayer(tornadoLayerRef, "tornado", "tornado", "#ef4444");
      fetch(getAlertUrl("tornado_watch"))
        .then((r) => r.json())
        .then((data) => {
          const features = data?.features || [];
          // Only consider features with event "Tornado Watch"
          const tornadoWatches = features.filter((f) => {
            const event = f?.properties?.event || '';
            return event === 'Tornado Watch';
          });
          setActiveTornadoWatch(
            Boolean(userLocation) &&
            tornadoWatches.some((f) => isFeatureNearLocation(f, userLocation, 150))
          );
        });
      refreshAlertLayer(thunderLayerRef, "severe", "thunderstorm", "#f97316");
      refreshAlertLayer(floodLayerRef, "flood", "flood", "#3b82f6");
      refreshAlertLayer(winterLayerRef, "winter", "winter", "#a855f7");
    };

    refreshAlertLayers();

    refreshTimerRef.current = setInterval(() => {
      refreshAlertLayers();
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(refreshTimerRef.current);
      [tornadoLayerRef, thunderLayerRef, floodLayerRef, winterLayerRef].forEach((r) => {
        if (r.current && leafletMap.current?.hasLayer(r.current)) leafletMap.current.removeLayer(r.current);
        r.current = null;
      });
    };
  }, [showNexrad, settings.station, showTornado, showThunderstorm, showFlood, showWinter, userLocation, isMapReady]);

  const handleConusView = () => {
    if (!leafletMap.current) return;
    leafletMap.current.setView([39.5, -98.35], 5);
  };

  // Fetch real-time wind speed from AerisWeather for the map center
  const fetchWindSpeed = useCallback(async (lat, lon) => {
    if (!AERIS_CLIENT_ID || !AERIS_CLIENT_SECRET) return;
    try {
      const url = `https://api.aerisapi.com/observations/closest?p=${lat},${lon}&client_id=${AERIS_CLIENT_ID}&client_secret=${AERIS_CLIENT_SECRET}&fields=ob.windMPH,ob.windDir,ob.windDirDEG,ob.windGustMPH,place.name,place.state`;
      const response = await fetch(url);
      if (!response.ok) return;
      const data = await response.json();
      if (data?.success && data.response?.length > 0) {
        const obs = data.response[0];
        const ob = obs.ob || {};
        const place = obs.place || {};
        setWindData({
          speedMph: ob.windMPH,
          directionDeg: ob.windDirDEG,
          gustMph: ob.windGustMPH,
          stationName: place.name ? `${place.name}${place.state ? `, ${place.state}` : ""}` : null,
        });
      }
    } catch (err) {
      console.warn("Wind speed fetch failed:", err);
    }
  }, []);

  // Fetch wind data on map moveend and on initial load
  useEffect(() => {
    if (!leafletMap.current || !isMapReady) return;

    const handleMoveEnd = () => {
      const center = leafletMap.current?.getCenter();
      if (center) {
        // Debounce: clear any pending fetch
        if (windFetchTimerRef.current) clearTimeout(windFetchTimerRef.current);
        windFetchTimerRef.current = setTimeout(() => {
          fetchWindSpeed(center.lat, center.lng);
        }, WIND_FETCH_DEBOUNCE_MS);
      }
    };

    // Fetch immediately for current position
    const center = leafletMap.current.getCenter();
    if (center) fetchWindSpeed(center.lat, center.lng);

    leafletMap.current.on("moveend", handleMoveEnd);
    return () => {
      leafletMap.current?.off("moveend", handleMoveEnd);
      if (windFetchTimerRef.current) clearTimeout(windFetchTimerRef.current);
    };
  }, [isMapReady, fetchWindSpeed]);

  const refreshWeatherData = async () => {
    // Force refresh NEXRAD radar layer
    if (radarLayerRef.current && leafletMap.current) {
      leafletMap.current.removeLayer(radarLayerRef.current);
      radarLayerRef.current = null;
    }

    if (leafletMap.current && showNexrad) {
      const tileUrl = 'https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-N0Q-0/{z}/{x}/{y}.png';
      radarLayerRef.current = L.tileLayer(tileUrl, {
        attribution: "NEXRAD data from Iowa Environmental Mesonet",
        opacity: ACTIVE_PRODUCT.opacity,
        minZoom: 4,
        maxZoom: 12,
        maxNativeZoom: 12,
        crossOrigin: "anonymous",
      }).addTo(leafletMap.current);
    }
  };
  const { isRefreshing, pullToRefreshHandlers } = usePullToRefresh({ onRefresh: refreshWeatherData });
  const showLocationError = (msg) => {
    if (locationErrorTimerRef.current) clearTimeout(locationErrorTimerRef.current);
    setLocationError(msg);
    locationErrorTimerRef.current = setTimeout(() => setLocationError(null), 4000);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) { showLocationError("Location services not supported."); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lon: longitude });
        leafletMap.current.setView([latitude, longitude], 12);
        if (userLocationMarkerRef.current) leafletMap.current.removeLayer(userLocationMarkerRef.current);
        userLocationMarkerRef.current = L.marker([latitude, longitude]).addTo(leafletMap.current).bindPopup("You're here!").openPopup();
      },
      () => showLocationError("Couldn't get location—check permissions.")
    );
  };

  const handleShowNexradChange = (value) => onSettingsChange({ ...settings, showNexrad: value });
  const handleAlertToggleChange = (key, value) => {
    if (key === "tornado") setShowTornado(value);
    if (key === "severe") setShowThunderstorm(value);
    if (key === "flood") setShowFlood(value);
    if (key === "winter") setShowWinter(value);
  };

  const handleLayersMenuToggle = () => {
    setIsLayersMenuOpen((prev) => !prev);
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
      <RadarLayersMenu
        isOpen={isLayersMenuOpen}
        onToggle={handleLayersMenuToggle}
        showNexrad={showNexrad}
        showRadio={showRadio}
        showLightning={showLightning}
        showHurricanes={showHurricanes}
        showSatellite={showSatellite}
        alertToggles={alertToggles}
        onShowNexradChange={handleShowNexradChange}
        onShowRadioChange={onToggleRadio}
        onShowLightningChange={setShowLightning}
        onShowHurricanesChange={setShowHurricanes}
        onShowSatelliteChange={setShowSatellite}
        onAlertToggleChange={handleAlertToggleChange}
      />
      <LightningLayer map={leafletMap.current} enabled={showLightning && isMapReady} />
      <HurricaneLayer map={leafletMap.current} enabled={showHurricanes && isMapReady} />
      <WindSpeedDisplay windData={windData} />
      <ProLegend productLabel={ACTIVE_PRODUCT.label} />
      <RadarStatusBar
        productLabel={ACTIVE_PRODUCT.label}
        isLooping={loopEnabled && loopPlaying}
        frameLabel={
          loopEnabled && loopFrames[loopIndex]?.time
            ? new Date(loopFrames[loopIndex].time * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
            : "Live"
        }
        warnings={activeWarningsCount}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-3 z-[1200] flex flex-col items-center gap-2 px-3">
        <ShelterAlert activeTornadoWarning={activeTornadoWarning} activeTornadoWatch={activeTornadoWatch} />
        {stormData && (
          <StormToolsPanel stormData={stormData} onClose={() => setStormData(null)} />
        )}
        {inspector?.active && <RadarInspectorPanel inspector={inspector} productLabel={ACTIVE_PRODUCT.label} />}
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
                productLabel={ACTIVE_PRODUCT.label}
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
        <div className="flex w-full max-w-md items-end justify-between gap-2">
          <TimeLapseBar
            enabled={loopEnabled}
            playing={loopPlaying}
            frameLabel={
              loopEnabled && loopFrames[loopIndex]?.time
                ? new Date(loopFrames[loopIndex].time * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
                : "Live"
            }
            speed={loopSpeed}
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
      </div>
      <div ref={mapRef} className="absolute inset-0 h-full min-h-[400px] w-full" role="application" aria-label="Interactive weather radar" />
      <div className="pointer-events-none absolute bottom-1 left-3 z-[999] text-[11px] font-semibold tracking-wide text-white/30">
        YouNeeK Pro Radar — by Andrew Gray
      </div>
    </div>
  );
}
