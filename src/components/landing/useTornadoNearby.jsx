import { useEffect, useState } from 'react';
import { useLocation } from './LocationContext';

// Ray-casting point-in-polygon. ring = [[lon, lat], ...]
function pointInRing(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect =
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInGeometry(lon, lat, geom) {
  if (!geom) return false;
  if (geom.type === 'Polygon') {
    return pointInRing(lon, lat, geom.coordinates[0]);
  }
  if (geom.type === 'MultiPolygon') {
    return geom.coordinates.some((poly) => pointInRing(lon, lat, poly[0]));
  }
  return false;
}

export default function useTornadoNearby() {
  const { gpsFix, location } = useLocation();
  const coords = gpsFix || (location?.source === 'gps' && location?.lat != null
    ? { lat: location.lat, lon: location.lon }
    : null);
  const [inWarning, setInWarning] = useState(false);
  const [warning, setWarning] = useState(null);

  useEffect(() => {
    if (!coords) return;
    let cancelled = false;

    const check = async () => {
      try {
        const res = await fetch(
          'https://api.weather.gov/alerts/active?event=Tornado%20Warning',
          { headers: { Accept: 'application/geo+json' } }
        );
        const data = await res.json();
        if (cancelled) return;
        const features = data.features || [];
        const hit = features.find((f) => pointInGeometry(coords.lon, coords.lat, f.geometry));
        setInWarning(!!hit);
        setWarning(hit || null);
      } catch (_) { /* silent */ }
    };

    check();
    const t = setInterval(check, 60000);
    return () => { cancelled = true; clearInterval(t); };
  }, [coords?.lat, coords?.lon]);

  return { coords, inWarning, warning };
}
