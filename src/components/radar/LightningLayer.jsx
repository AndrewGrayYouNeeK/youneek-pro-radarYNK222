import { useEffect, useRef } from "react";
import L from "leaflet";

export default function LightningLayer({ map, enabled }) {
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

    const loadStrikes = async () => {
      try {
        const response = await fetch("/api/lightning");
        const payload = await response.json();
        if (cancelled || !layerRef.current) return;
        layerRef.current.clearLayers();
        (payload.strikes || []).forEach((strike) => {
          const color = strike.kind === "storm" ? "#fb923c" : "#fde047";
          const icon = L.divIcon({
            className: "lightning-strike-icon",
            html: `<span style="display:block;width:10px;height:10px;border-radius:999px;background:${color};box-shadow:0 0 10px ${color};"></span>`,
            iconSize: [10, 10],
            iconAnchor: [5, 5],
          });
          L.marker([strike.lat, strike.lon], { icon })
            .bindPopup(
              `<div style="font-size:12px"><strong>${strike.kind === "storm" ? "Storm report" : "Lightning"}</strong><br/>${strike.ageMinutes ?? "?"} min ago<br/>${strike.source || ""}</div>`
            )
            .addTo(layerRef.current);
        });
      } catch {
        // Keep last markers if refresh fails.
      }
    };

    loadStrikes();
    const timer = window.setInterval(loadStrikes, 60000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      if (layerRef.current && map.hasLayer(layerRef.current)) map.removeLayer(layerRef.current);
      layerRef.current = null;
    };
  }, [map, enabled]);

  return null;
}
