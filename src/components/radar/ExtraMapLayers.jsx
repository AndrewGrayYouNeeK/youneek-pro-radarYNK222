import { useEffect, useRef } from "react";
import L from "leaflet";
import { gibsVisibleFrames, IOWA_SATELLITE } from "@/lib/radar/satelliteTiles";
import { SPC_MD_URL, SPC_OUTLOOKS, USGS_QUAKES_URL, WPC_FRONTS_URL, snowAnalysisUrl, wfigsPerimeterUrl } from "@/lib/radar/overlaySources";
import { syncFrameLayers } from "@/lib/radar/loopFrames";
import { formatSampleLabel, sampleLabelInk, shouldDrawSampleGrid } from "@/lib/radar/sampleGrid";

const SURFACE_FIELDS = {
  temperature: "temperature_2m",
  feelsLike: "apparent_temperature",
  dewpoint: "dew_point_2m",
  humidity: "relative_humidity_2m",
  uv: "uv_index",
  clouds: "cloud_cover",
  pressure: "pressure_msl",
};

function colorFor(field, value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "#94a3b8";
  if (field === "humidity" || field === "clouds") {
    const tone = Math.max(0, Math.min(255, Math.round((number / 100) * 255)));
    return `rgb(${80}, ${140}, ${tone})`;
  }
  if (field === "uv") {
    if (number >= 8) return "#7e22ce";
    if (number >= 6) return "#ef4444";
    if (number >= 3) return "#eab308";
    return "#22c55e";
  }
  if (field === "pressure") {
    if (number >= 1022) return "#38bdf8";
    if (number <= 1008) return "#f97316";
    return "#e2e8f0";
  }
  if (number <= 32) return "#38bdf8";
  if (number <= 60) return "#22c55e";
  if (number <= 80) return "#eab308";
  return "#ef4444";
}

function addSampleMarker(group, lat, lon, field, value, color, popup) {
  const label = formatSampleLabel(field, value);
  if (!label) return;
  const ink = sampleLabelInk(color);
  const icon = L.divIcon({
    className: "ynk-wx-sample",
    html: `<span class="ynk-wx-sample-label" data-ynk-sample="${field}" style="--ynk-sample:${color};color:${ink}">${label}</span>`,
    iconSize: [64, 20],
    iconAnchor: [32, 10],
  });
  L.marker([lat, lon], { icon, keyboard: false })
    .bindPopup(`<div style="font-size:12px">${popup}</div>`)
    .addTo(group);
}

function gridPoints(bounds, rows, cols) {
  const points = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      points.push({
        lat: bounds.getSouth() + ((bounds.getNorth() - bounds.getSouth()) * row) / Math.max(1, rows - 1),
        lon: bounds.getWest() + ((bounds.getEast() - bounds.getWest()) * col) / Math.max(1, cols - 1),
      });
    }
  }
  return points;
}

function addGeoJson(map, group, payload, styleFor) {
  if (!payload || payload.type !== "FeatureCollection") return;
  L.geoJSON(payload, {
    style: (feature) => styleFor(feature),
    pointToLayer: (feature, latlng) => {
      const mag = Number(feature?.properties?.mag);
      return L.circleMarker(latlng, {
        radius: Number.isFinite(mag) ? Math.max(4, mag * 2) : 5,
        color: "#f8fafc",
        weight: 1,
        fillColor: "#fb7185",
        fillOpacity: 0.85,
      });
    },
    onEachFeature: (feature, layer) => {
      const props = feature?.properties || {};
      const title = props.LABEL2 || props.LABEL || props.name || props.title || props.poly_IncidentName || props.irwin_IncidentName || "Feature";
      layer.bindPopup(`<div style="font-size:12px">${title}</div>`);
    },
  }).addTo(group);
}

export default function ExtraMapLayers({ map, ready, satelliteMode, surfaceField, overlays }) {
  const satelliteLayers = useRef([]);
  const groups = useRef({});

  useEffect(() => {
    if (!map || !ready) return undefined;
    satelliteLayers.current.forEach((layer) => {
      if (map.hasLayer(layer)) map.removeLayer(layer);
    });
    satelliteLayers.current = [];
    if (!satelliteMode || satelliteMode === "off") return undefined;

    if (satelliteMode === "visible") {
      const frames = gibsVisibleFrames();
      const plan = syncFrameLayers([], frames);
      satelliteLayers.current = plan.layers.map((item, index) =>
        L.tileLayer(item.tileUrl, {
          opacity: index === plan.layers.length - 1 ? 0.55 : 0,
          maxZoom: 7,
          maxNativeZoom: 7,
          zIndex: 210,
          attribution: "GOES visible via NASA GIBS",
        }).addTo(map)
      );
      let frame = satelliteLayers.current.length - 1;
      const timer = window.setInterval(() => {
        frame = (frame + 1) % satelliteLayers.current.length;
        satelliteLayers.current.forEach((layer, index) => layer.setOpacity(index === frame ? 0.55 : 0));
      }, 900);
      return () => {
        window.clearInterval(timer);
        satelliteLayers.current.forEach((layer) => map.hasLayer(layer) && map.removeLayer(layer));
        satelliteLayers.current = [];
      };
    }

    const url = satelliteMode === "ir" ? IOWA_SATELLITE.ir : IOWA_SATELLITE.vapor;
    const layer = L.tileLayer(url, {
      opacity: 0.5,
      maxZoom: 8,
      maxNativeZoom: 8,
      zIndex: 210,
      attribution: satelliteMode === "ir" ? "GOES infrared via Iowa Mesonet" : "GOES water vapor via Iowa Mesonet",
    }).addTo(map);
    satelliteLayers.current = [layer];
    return () => {
      if (map.hasLayer(layer)) map.removeLayer(layer);
      satelliteLayers.current = [];
    };
  }, [map, ready, satelliteMode]);

  useEffect(() => {
    if (!map || !ready) return undefined;
    const specs = [
      ["spc1", overlays.spc1, SPC_OUTLOOKS.spc1],
      ["spc2", overlays.spc2, SPC_OUTLOOKS.spc2],
      ["spc3", overlays.spc3, SPC_OUTLOOKS.spc3],
      ["md", overlays.md, SPC_MD_URL],
      ["fronts", overlays.fronts, WPC_FRONTS_URL],
      ["quakes", overlays.quakes, USGS_QUAKES_URL],
    ];
    let cancelled = false;
    specs.forEach(([key, enabled, url]) => {
      if (groups.current[key]) {
        map.removeLayer(groups.current[key]);
        groups.current[key] = null;
      }
      if (!enabled) return;
      const group = L.layerGroup().addTo(map);
      groups.current[key] = group;
      fetch(url)
        .then((response) => response.json())
        .then((payload) => {
          if (cancelled || groups.current[key] !== group) return;
          addGeoJson(map, group, payload, (feature) => ({
            color: feature?.properties?.stroke || (key === "fronts" ? "#38bdf8" : "#f59e0b"),
            weight: key === "fronts" ? 2 : 1,
            fillColor: feature?.properties?.fill || "#f59e0b",
            fillOpacity: key === "quakes" ? 0 : 0.25,
          }));
        })
        .catch(() => {});
    });
    return () => {
      cancelled = true;
      specs.forEach(([key]) => {
        if (groups.current[key] && map.hasLayer(groups.current[key])) map.removeLayer(groups.current[key]);
        groups.current[key] = null;
      });
    };
  }, [map, ready, overlays.spc1, overlays.spc2, overlays.spc3, overlays.md, overlays.fronts, overlays.quakes]);

  useEffect(() => {
    if (!map || !ready || !overlays.perimeters) {
      if (groups.current.perimeters && map) {
        map.removeLayer(groups.current.perimeters);
        groups.current.perimeters = null;
      }
      return undefined;
    }
    const group = L.layerGroup().addTo(map);
    groups.current.perimeters = group;
    let cancelled = false;
    const load = () => {
      const bounds = map.getBounds();
      fetch(wfigsPerimeterUrl(bounds))
        .then((response) => response.json())
        .then((payload) => {
          if (cancelled) return;
          group.clearLayers();
          addGeoJson(map, group, payload, () => ({ color: "#fb923c", weight: 2, fillColor: "#ea580c", fillOpacity: 0.25 }));
        })
        .catch(() => {});
    };
    load();
    map.on("moveend", load);
    return () => {
      cancelled = true;
      map.off("moveend", load);
      if (map.hasLayer(group)) map.removeLayer(group);
      groups.current.perimeters = null;
    };
  }, [map, ready, overlays.perimeters]);

  useEffect(() => {
    if (!map || !ready || !overlays.snow) {
      if (groups.current.snow && map) {
        map.removeLayer(groups.current.snow);
        groups.current.snow = null;
      }
      return undefined;
    }
    let overlay = null;
    let cancelled = false;
    const load = () => {
      const bounds = map.getBounds();
      const next = L.imageOverlay(snowAnalysisUrl(bounds), bounds, { opacity: 0.55 });
      next.addTo(map);
      if (overlay && map.hasLayer(overlay)) map.removeLayer(overlay);
      overlay = next;
      groups.current.snow = next;
    };
    load();
    map.on("moveend", load);
    return () => {
      cancelled = true;
      map.off("moveend", load);
      if (overlay && map.hasLayer(overlay)) map.removeLayer(overlay);
      groups.current.snow = null;
      return cancelled;
    };
  }, [map, ready, overlays.snow]);

  useEffect(() => {
    if (!map || !ready || !surfaceField || surfaceField === "off") {
      if (groups.current.surface && map) {
        map.removeLayer(groups.current.surface);
        groups.current.surface = null;
      }
      return undefined;
    }
    const group = L.layerGroup().addTo(map);
    groups.current.surface = group;
    let cancelled = false;
    const field = SURFACE_FIELDS[surfaceField] || "temperature_2m";
    const load = () => {
      if (!shouldDrawSampleGrid(map.getZoom())) {
        group.clearLayers();
        return;
      }
      const points = gridPoints(map.getBounds(), 6, 6);
      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.searchParams.set("latitude", points.map((point) => point.lat.toFixed(3)).join(","));
      url.searchParams.set("longitude", points.map((point) => point.lon.toFixed(3)).join(","));
      url.searchParams.set("current", field);
      url.searchParams.set("temperature_unit", "fahrenheit");
      fetch(url.toString())
        .then((response) => response.json())
        .then((payload) => {
          if (cancelled) return;
          group.clearLayers();
          if (!shouldDrawSampleGrid(map.getZoom())) return;
          const rows = Array.isArray(payload) ? payload : [payload];
          rows.forEach((row, index) => {
            const value = row?.current?.[field];
            const point = points[index];
            if (!point || value == null) return;
            addSampleMarker(
              group,
              point.lat,
              point.lon,
              surfaceField,
              value,
              colorFor(surfaceField, value),
              `${field.replace(/_/g, " ")}: ${value}`
            );
          });
        })
        .catch(() => {});
    };
    load();
    map.on("moveend", load);
    return () => {
      cancelled = true;
      map.off("moveend", load);
      if (map.hasLayer(group)) map.removeLayer(group);
      groups.current.surface = null;
    };
  }, [map, ready, surfaceField]);

  useEffect(() => {
    if (!map || !ready || !overlays.air) {
      if (groups.current.air && map) {
        map.removeLayer(groups.current.air);
        groups.current.air = null;
      }
      return undefined;
    }
    const group = L.layerGroup().addTo(map);
    groups.current.air = group;
    let cancelled = false;
    const load = () => {
      if (!shouldDrawSampleGrid(map.getZoom())) {
        group.clearLayers();
        return;
      }
      const points = gridPoints(map.getBounds(), 5, 5);
      const url = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
      url.searchParams.set("latitude", points.map((point) => point.lat.toFixed(3)).join(","));
      url.searchParams.set("longitude", points.map((point) => point.lon.toFixed(3)).join(","));
      url.searchParams.set("current", "us_aqi");
      fetch(url.toString())
        .then((response) => response.json())
        .then((payload) => {
          if (cancelled) return;
          group.clearLayers();
          if (!shouldDrawSampleGrid(map.getZoom())) return;
          const rows = Array.isArray(payload) ? payload : [payload];
          rows.forEach((row, index) => {
            const value = row?.current?.us_aqi;
            const point = points[index];
            if (!point || value == null) return;
            const color = value > 150 ? "#7e22ce" : value > 100 ? "#ef4444" : value > 50 ? "#eab308" : "#22c55e";
            addSampleMarker(group, point.lat, point.lon, "air", value, color, `US AQI ${value}`);
          });
        })
        .catch(() => {});
    };
    load();
    map.on("moveend", load);
    return () => {
      cancelled = true;
      map.off("moveend", load);
      if (map.hasLayer(group)) map.removeLayer(group);
      groups.current.air = null;
    };
  }, [map, ready, overlays.air]);

  return null;
}
