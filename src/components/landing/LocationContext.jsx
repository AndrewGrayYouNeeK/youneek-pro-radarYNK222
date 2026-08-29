import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { invokeNwsData } from '@/api/nwsData';

const LocationCtx = createContext(null);

export const SETTINGS_KEY = 'younk_pro_radar_settings_v1';
export const LEGACY_LOC_KEY = 'younk_radar_location_v1';
export const LEGACY_SOS_KEY = 'younk_sos_profile_v1';

export const DEFAULT_SOS = {
  name: '',
  contact: '',
  message: "SOS — I'm trapped and need help. My location:",
};

// Old landing used this as a fake "you are here". Never treat it as the user.
const PLACEHOLDER_DENVER = { lat: 39.7392, lon: -104.9903 };

function isPlaceholderDenver(loc) {
  if (!loc) return true;
  if (loc.source === 'gps' || loc.source === 'search') return false;
  return (
    Math.abs(Number(loc.lat) - PLACEHOLDER_DENVER.lat) < 0.001 &&
    Math.abs(Number(loc.lon) - PLACEHOLDER_DENVER.lon) < 0.001
  );
}

function milesBetween(a, b) {
  if (!a || !b) return Infinity;
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const loc = parsed.location && !isPlaceholderDenver(parsed.location) ? parsed.location : null;
      return { location: loc, sos: { ...DEFAULT_SOS, ...(parsed.sos || {}) } };
    }
  } catch (_) { /* ignore */ }

  let location = null;
  let sos = { ...DEFAULT_SOS };
  try {
    const l = localStorage.getItem(LEGACY_LOC_KEY);
    if (l) {
      const parsed = JSON.parse(l);
      if (!isPlaceholderDenver(parsed)) location = parsed;
    }
  } catch (_) { /* ignore */ }
  try {
    const s = localStorage.getItem(LEGACY_SOS_KEY);
    if (s) sos = { ...DEFAULT_SOS, ...JSON.parse(s) };
  } catch (_) { /* ignore */ }
  return { location, sos };
}

function persist(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    if (settings.location) localStorage.setItem(LEGACY_LOC_KEY, JSON.stringify(settings.location));
    else localStorage.removeItem(LEGACY_LOC_KEY);
    localStorage.setItem(LEGACY_SOS_KEY, JSON.stringify(settings.sos));
  } catch (_) { /* ignore */ }
}

async function locFromCoords(lat, lon, accuracy) {
  try {
    const res = await invokeNwsData({ action: 'point', lat, lon });
    const city = res.data?.location?.city || 'Current';
    const state = res.data?.location?.state || '';
    return {
      label: `${city}${state ? ', ' + state : ''}`,
      city,
      state,
      lat,
      lon,
      accuracy,
      source: 'gps',
    };
  } catch {
    return {
      label: `${Number(lat).toFixed(3)}°, ${Number(lon).toFixed(3)}°`,
      city: '',
      state: '',
      lat,
      lon,
      accuracy,
      source: 'gps',
    };
  }
}

export function LocationProvider({ children }) {
  const [location, setLocationState] = useState(null);
  const [sos, setSosState] = useState(DEFAULT_SOS);
  const [hydrated, setHydrated] = useState(false);
  const [locating, setLocating] = useState(true);
  const [gpsStatus, setGpsStatus] = useState('locating');
  const [gpsFix, setGpsFix] = useState(null);

  const sourceRef = useRef(null);
  const locationRef = useRef(null);
  const sosRef = useRef(DEFAULT_SOS);

  const persistAll = useCallback((loc, profile) => {
    persist({ location: loc, sos: profile });
  }, []);

  const updateLocation = useCallback((loc) => {
    locationRef.current = loc;
    sourceRef.current = loc?.source || null;
    setLocationState(loc);
    persistAll(loc, sosRef.current);
  }, [persistAll]);

  const updateSos = useCallback((profile) => {
    sosRef.current = profile;
    setSosState(profile);
    persistAll(locationRef.current, profile);
  }, [persistAll]);

  useEffect(() => {
    const loaded = loadSettings();
    locationRef.current = loaded.location;
    sosRef.current = loaded.sos;
    sourceRef.current = loaded.location?.source || null;
    setLocationState(loaded.location);
    setSosState(loaded.sos);
    setHydrated(true);
    if (loaded.location?.source === 'search') {
      setLocating(false);
      setGpsStatus('ok');
    } else {
      setLocating(true);
      setGpsStatus('locating');
    }
  }, []);

  const applyPosition = useCallback(async (pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const accuracy = pos.coords.accuracy;
    setGpsFix({ lat, lon, accuracy });
    setGpsStatus('ok');

    // Manual city search wins until the user taps Use My GPS
    if (sourceRef.current === 'search') {
      setLocating(false);
      return;
    }

    const prev = locationRef.current;
    if (prev?.source === 'gps' && milesBetween(prev, { lat, lon }) < 0.3) {
      updateLocation({ ...prev, lat, lon, accuracy, source: 'gps' });
      setLocating(false);
      return;
    }

    const loc = await locFromCoords(lat, lon, accuracy);
    updateLocation(loc);
    setLocating(false);
  }, [updateLocation]);

  useEffect(() => {
    if (!hydrated) return;
    if (!navigator.geolocation) {
      setGpsStatus('unavailable');
      setLocating(false);
      return;
    }

    let cancelled = false;
    const onPos = (pos) => {
      if (!cancelled) applyPosition(pos);
    };
    const onErr = (err) => {
      if (cancelled) return;
      setLocating(false);
      if (err?.code === 1) setGpsStatus('denied');
      else setGpsStatus(locationRef.current ? 'ok' : 'error');
    };

    const opts = { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 };
    navigator.geolocation.getCurrentPosition(onPos, onErr, opts);
    const watchId = navigator.geolocation.watchPosition(onPos, onErr, {
      ...opts,
      maximumAge: 15000,
    });

    return () => {
      cancelled = true;
      navigator.geolocation.clearWatch(watchId);
    };
  }, [hydrated, applyPosition]);

  const detectGPS = useCallback(
    () =>
      new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          setGpsStatus('unavailable');
          return reject(new Error('Geolocation unavailable'));
        }
        setLocating(true);
        setGpsStatus('locating');
        sourceRef.current = 'gps';
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const loc = await locFromCoords(
                pos.coords.latitude,
                pos.coords.longitude,
                pos.coords.accuracy
              );
              setGpsFix({
                lat: pos.coords.latitude,
                lon: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
              });
              updateLocation(loc);
              setGpsStatus('ok');
              setLocating(false);
              resolve(loc);
            } catch (e) {
              setLocating(false);
              reject(e);
            }
          },
          (err) => {
            setLocating(false);
            setGpsStatus(err?.code === 1 ? 'denied' : 'error');
            reject(err);
          },
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
        );
      }),
    [updateLocation]
  );

  const search = async (q) => {
    const res = await invokeNwsData({ action: 'geocode', q });
    return res.data?.results || [];
  };

  const setSearchedLocation = (loc) => {
    updateLocation({ ...loc, source: 'search' });
    setLocating(false);
    setGpsStatus('ok');
  };

  return (
    <LocationCtx.Provider
      value={{
        location,
        setLocation: setSearchedLocation,
        detectGPS,
        search,
        hydrated,
        locating,
        gpsStatus,
        gpsFix,
        sos,
        setSos: updateSos,
      }}
    >
      {children}
    </LocationCtx.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationCtx);
  if (!ctx) throw new Error('useLocation must be used inside LocationProvider');
  return ctx;
}

export function useWeatherSettings() {
  return useLocation();
}
