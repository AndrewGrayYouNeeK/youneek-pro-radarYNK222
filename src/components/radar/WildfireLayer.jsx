import { useEffect, useRef } from "react";
import L from "leaflet";

export default function WildfireLayer({ map, enabled }) {
  const layerRef = useRef(null);

  useEffect(() => {
    if (!map || !enabled) {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      return undefined;
    }

    layerRef.current = L.layerGroup().addTo(map);
    let cancelled = false;

    fetch("/api/fires")
      .then((response) => response.json())
      .then((payload) => {
        if (cancelled || !layerRef.current) return;
        const detections = (payload.detections || []).slice(0, 250);
        detections.forEach((fire) => {
          L.circleMarker([fire.lat, fire.lon], {
            radius: 4,
            color: "#fdba74",
            fillColor: "#ea580c",
            fillOpacity: 0.8,
            weight: 1,
          })
            .bindPopup(
              `<div style="font-size:12px"><strong>Fire detection</strong><br/>FRP ${Number(fire.frp || 0).toFixed(1)} · ${fire.date || ""}</div>`
            )
            .addTo(layerRef.current);
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
