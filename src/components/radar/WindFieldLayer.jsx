import { useEffect, useRef } from "react";
import L from "leaflet";
import { advectDegrees, meteorologicalVector } from "@/lib/weather/windField";

const PARTICLE_COUNT = 56;
const STEP_SECONDS = 90;

function sampleGrid(bounds) {
  const lats = [];
  const lons = [];
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      lats.push(bounds.getSouth() + ((bounds.getNorth() - bounds.getSouth()) * row) / 3);
      lons.push(bounds.getWest() + ((bounds.getEast() - bounds.getWest()) * col) / 3);
    }
  }
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lats.join(","));
  url.searchParams.set("longitude", lons.join(","));
  url.searchParams.set("current", "wind_speed_10m,wind_direction_10m");
  url.searchParams.set("wind_speed_unit", "ms");
  return fetch(url.toString(), { signal: AbortSignal.timeout(12000) })
    .then((response) => response.json())
    .then((payload) => {
      const rows = Array.isArray(payload) ? payload : [payload];
      return rows
        .map((row, index) => {
          const vector = meteorologicalVector(row?.current?.wind_direction_10m, row?.current?.wind_speed_10m);
          return {
            lat: lats[index],
            lon: lons[index],
            east: vector.east,
            north: vector.north,
          };
        })
        .filter((row) => Number.isFinite(row.lat) && Number.isFinite(row.east));
    });
}

function nearestVector(samples, lat, lon) {
  let best = samples[0];
  let bestDistance = Infinity;
  samples.forEach((sample) => {
    const distance = (sample.lat - lat) ** 2 + (sample.lon - lon) ** 2;
    if (distance < bestDistance) {
      best = sample;
      bestDistance = distance;
    }
  });
  return best || { east: 0, north: 0 };
}

function spawn(map) {
  const bounds = map.getBounds();
  return {
    lat: bounds.getSouth() + Math.random() * (bounds.getNorth() - bounds.getSouth()),
    lon: bounds.getWest() + Math.random() * (bounds.getEast() - bounds.getWest()),
    life: 40 + Math.round(Math.random() * 80),
  };
}

export default function WindFieldLayer({ map, enabled }) {
  const samplesRef = useRef([]);
  const frameRef = useRef(0);

  useEffect(() => {
    if (!map || !enabled) return undefined;

    const paneName = "windPane";
    if (!map.getPane(paneName)) {
      map.createPane(paneName);
    }
    const pane = map.getPane(paneName);
    pane.style.zIndex = "450";
    pane.style.pointerEvents = "none";

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    pane.appendChild(canvas);
    const particles = Array.from({ length: PARTICLE_COUNT }, () => spawn(map));
    let cancelled = false;

    const placeCanvas = () => {
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;
      canvas.style.width = `${size.x}px`;
      canvas.style.height = `${size.y}px`;
      L.DomUtil.setPosition(canvas, map.containerPointToLayerPoint([0, 0]));
    };

    let sampleTimer = 0;
    const loadSamples = () => {
      window.clearTimeout(sampleTimer);
      sampleTimer = window.setTimeout(() => {
        sampleGrid(map.getBounds())
          .then((samples) => {
            if (!cancelled) samplesRef.current = samples;
          })
          .catch(() => {});
      }, 600);
    };

    const draw = () => {
      if (cancelled) return;
      placeCanvas();
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
      const samples = samplesRef.current;
      context.strokeStyle = "rgba(125, 211, 252, 0.8)";
      context.lineWidth = 1.4;
      particles.forEach((particle) => {
        const point = map.latLngToContainerPoint([particle.lat, particle.lon]);
        const vector = samples.length ? nearestVector(samples, particle.lat, particle.lon) : { east: 1, north: 0 };
        const next = advectDegrees(particle.lat, particle.lon, vector.east, vector.north, STEP_SECONDS);
        const nextPoint = map.latLngToContainerPoint([next.lat, next.lon]);
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(nextPoint.x, nextPoint.y);
        context.stroke();
        particle.lat = next.lat;
        particle.lon = next.lon;
        particle.life -= 1;
        const bounds = map.getBounds();
        if (particle.life <= 0 || !bounds.contains([particle.lat, particle.lon])) {
          Object.assign(particle, spawn(map));
        }
      });
      frameRef.current = window.setTimeout(draw, 140);
    };

    placeCanvas();
    loadSamples();
    draw();
    map.on("moveend", loadSamples);

    return () => {
      cancelled = true;
      window.clearTimeout(frameRef.current);
      window.clearTimeout(sampleTimer);
      map.off("moveend", loadSamples);
      canvas.remove();
    };
  }, [map, enabled]);

  return null;
}
