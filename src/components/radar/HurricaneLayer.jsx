import { useEffect, useRef } from "react";
import L from "leaflet";
import { nhcLayerIds, nhcQueryUrl } from "@/lib/weather/nhcLayers";

function addGeoJson(group, payload, style) {
  if (!payload || payload.type !== "FeatureCollection") return;
  L.geoJSON(payload, {
    style,
    pointToLayer: (_feature, latlng) =>
      L.circleMarker(latlng, {
        radius: 5,
        color: "#fecdd3",
        fillColor: "#e11d48",
        fillOpacity: 0.9,
        weight: 2,
      }),
    onEachFeature: (feature, layer) => {
      const name = feature?.properties?.STORMNAME || feature?.properties?.stormname || "Tropical cyclone";
      const type = feature?.properties?.STORMTYPE || feature?.properties?.stormtype || "";
      layer.bindPopup(`<div style="font-size:12px"><strong>${name}</strong><br/>${type}</div>`);
    },
  }).addTo(group);
}

export default function HurricaneLayer({ map, enabled }) {
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

    fetch("/api/getActiveStorms")
      .then((response) => response.json())
      .then(async (payload) => {
        if (cancelled) return;
        const storms = payload.activeStorms || payload.currentStorms || [];
        await Promise.all(
          storms.map(async (storm) => {
            const lat = Number(storm.latitudeNumeric ?? storm.latitude ?? storm.lat);
            const lon = Number(storm.longitudeNumeric ?? storm.longitude ?? storm.lon);
            if (Number.isFinite(lat) && Number.isFinite(lon)) {
              L.circleMarker([lat, lon], {
                radius: 8,
                color: "#fb7185",
                fillColor: "#be123c",
                fillOpacity: 0.9,
                weight: 2,
              })
                .bindPopup(
                  `<div style="font-size:12px"><strong>${storm.name || "Tropical cyclone"}</strong><br/>${storm.classification || ""} · ${storm.intensity || ""} kt</div>`
                )
                .addTo(group);
            }

            const layers = nhcLayerIds(storm.binNumber);
            if (!layers) return;
            const [track, cone, past] = await Promise.all(
              [layers.forecastTrack, layers.cone, layers.pastTrack].map((id) =>
                fetch(nhcQueryUrl(id))
                  .then((response) => (response.ok ? response.json() : null))
                  .catch(() => null)
              )
            );
            if (cancelled) return;
            addGeoJson(group, past, { color: "#fda4af", weight: 3, opacity: 0.9 });
            addGeoJson(group, track, { color: "#fb7185", weight: 3, opacity: 0.95, dashArray: "6 4" });
            addGeoJson(group, cone, { color: "#fecdd3", weight: 1, opacity: 0.8, fillColor: "#fb7185", fillOpacity: 0.12 });
          })
        );
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
