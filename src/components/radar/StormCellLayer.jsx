import { useEffect, useRef } from "react";
import L from "leaflet";

const LSR_URL = "https://mesonet.agron.iastate.edu/geojson/lsr.py?hours=6";

function colorFor(type) {
  const name = String(type || "").toUpperCase();
  if (name.includes("TORN")) return "#ef4444";
  if (name.includes("HAIL")) return "#e2e8f0";
  if (name.includes("WIND")) return "#f59e0b";
  return "#38bdf8";
}

export default function StormCellLayer({ map, enabled }) {
  const layerRef = useRef(null);

  useEffect(() => {
    if (!map || !enabled) {
      if (layerRef.current && map) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      return undefined;
    }

    layerRef.current = L.layerGroup().addTo(map);
    const group = layerRef.current;
    let cancelled = false;

    fetch(LSR_URL)
      .then((response) => response.json())
      .then((payload) => {
        if (cancelled) return;
        const features = (payload.features || []).slice(0, 80);
        features.forEach((feature) => {
          const [lon, lat] = feature.geometry?.coordinates || [];
          if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
          const props = feature.properties || {};
          const color = colorFor(props.typetext || props.type);
          L.circleMarker([lat, lon], {
            radius: 6,
            color,
            fillColor: color,
            fillOpacity: 0.85,
            weight: 1,
          })
            .bindPopup(
              `<div style="font-size:12px"><strong>${props.typetext || "Storm report"}</strong><br/>${props.city || ""} ${props.st || ""}<br/>${props.magnitude || ""} ${props.unit || ""}</div>`
            )
            .addTo(group);
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (layerRef.current && map.hasLayer(layerRef.current)) map.removeLayer(layerRef.current);
      layerRef.current = null;
    };
  }, [map, enabled]);

  return null;
}
