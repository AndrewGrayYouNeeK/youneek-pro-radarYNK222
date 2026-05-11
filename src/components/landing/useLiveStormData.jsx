import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useLocation } from './LocationContext';

// Polls real NWS observations + real NEXRAD storm-cell attributes
// based on the user's selected location.
export default function useLiveStormData() {
  const { location } = useLocation();
  const [obs, setObs] = useState(null);       // { windMps, windDir, ... }
  const [cells, setCells] = useState([]);     // real storm cells near user
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!location?.lat || !location?.lon) return;
    let cancelled = false;

    const fetchAll = async () => {
      try {
        const [pointRes, cellsRes] = await Promise.all([
          base44.functions.invoke('nwsData', {
            action: 'point', lat: location.lat, lon: location.lon,
          }),
          base44.functions.invoke('nwsData', {
            action: 'cells', lat: location.lat, lon: location.lon,
          }),
        ]);
        if (cancelled) return;
        setObs(pointRes.data?.observation || null);
        setCells(cellsRes.data?.cells || []);
        setError(null);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load live data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    // Obs refresh ~every 5 min; cells update every ~5 min NEXRAD volume scan
    const id = setInterval(fetchAll, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(id); };
  }, [location?.lat, location?.lon]);

  return { obs, cells, loading, error, location };
}