import React, { createContext, useContext, useEffect, useState } from 'react';
import { invokeNwsData } from '@/api/nwsData';

const LocationCtx = createContext(null);

const STORAGE_KEY = 'younk_radar_location_v1';

const DEFAULT_LOC = {
  label: 'Denver, CO',
  city: 'Denver',
  state: 'CO',
  lat: 39.7392,
  lon: -104.9903,
};

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(DEFAULT_LOC);
  const [hydrated, setHydrated] = useState(false);
  const [hasStoredLocation, setHasStoredLocation] = useState(false);

  // hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setLocation(JSON.parse(raw));
        setHasStoredLocation(true);
      }
    } catch (_) { /* ignore */ }
    setHydrated(true);
  }, []);

  // Auto-detect GPS on first visit (no stored location yet)
  useEffect(() => {
    if (!hydrated || hasStoredLocation) return;
    if (!navigator.geolocation) return;
    detectGPS().catch(() => { /* silently fall back to default */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, hasStoredLocation]);

  const updateLocation = (loc) => {
    setLocation(loc);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(loc)); } catch (_) { /* ignore */ }
  };

  const detectGPS = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('Geolocation unavailable'));
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          // Use NWS point endpoint to derive city/state for a nice label
          try {
            const res = await invokeNwsData({
              action: 'point', lat: latitude, lon: longitude,
            });
            const city = res.data?.location?.city || 'Current';
            const state = res.data?.location?.state || '';
            const loc = {
              label: `${city}${state ? ', ' + state : ''}`,
              city, state, lat: latitude, lon: longitude,
            };
            updateLocation(loc);
            resolve(loc);
          } catch (e) {
            const loc = { label: 'Your Location', city: '', state: '', lat: latitude, lon: longitude };
            updateLocation(loc);
            resolve(loc);
          }
        },
        (err) => reject(err),
        { enableHighAccuracy: false, timeout: 8000 }
      );
    });

  const search = async (q) => {
    const res = await invokeNwsData({ action: 'geocode', q });
    return res.data?.results || [];
  };

  return (
    <LocationCtx.Provider value={{ location, setLocation: updateLocation, detectGPS, search, hydrated }}>
      {children}
    </LocationCtx.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationCtx);
  if (!ctx) throw new Error('useLocation must be used inside LocationProvider');
  return ctx;
}