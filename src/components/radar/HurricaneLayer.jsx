import { useEffect, useRef } from "react";
import L from "leaflet";

export default function HurricaneLayer({ map, enabled }) {
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

    fetch("/api/getActiveStorms")
      .then((response) => response.json())
      .then((payload) => {
        if (cancelled || !layerRef.current) return;
        const storms = payload.activeStorms || payload.currentStorms || [];
        storms.forEach((storm) => {
          const lat = Number(storm.latitude ?? storm.lat);
          const lon = Number(storm.longitude ?? storm.lon);
          if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
          L.circleMarker([lat, lon], {
            radius: 8,
            color: "#fb7185",
            fillColor: "#be123c",
            fillOpacity: 0.85,
            weight: 2,
          })
            .bindPopup(
              `<div style="font-size:12px"><strong>${storm.name || "Tropical cyclone"}</strong><br/>${storm.classification || storm.binNumber || ""}</div>`
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
