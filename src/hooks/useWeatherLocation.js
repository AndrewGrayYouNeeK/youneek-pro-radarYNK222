import { useCallback, useEffect, useState } from "react";
import {
  FALLBACK_LOCATION,
  loadActiveLocation,
  saveActiveLocation,
} from "@/lib/locationStore";

export default function useWeatherLocation() {
  const [coords, setCoords] = useState(() => loadActiveLocation());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!coords);

  const applyLocation = useCallback((next) => {
    const location = {
      latitude: next.latitude,
      longitude: next.longitude,
      label: next.label || "Selected location",
      source: next.source || "manual",
    };
    setCoords(location);
    saveActiveLocation(location);
    setError("");
    setLoading(false);
  }, []);

  const requestLocation = useCallback(() => {
    setLoading(true);
    setError("");

    if (!navigator.geolocation) {
      applyLocation({ ...FALLBACK_LOCATION, source: "fallback" });
      setError("Location services are not available. Showing a US overview — search any city.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        applyLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: "My location",
          source: "gps",
        });
      },
      () => {
        const previous = loadActiveLocation();
        if (previous) {
          applyLocation(previous);
          setError("Using your last saved place. Allow location or search to change it.");
          return;
        }
        applyLocation({ ...FALLBACK_LOCATION, source: "fallback" });
        setError("Allow location or search a city to get a local forecast.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, [applyLocation]);

  useEffect(() => {
    if (coords?.source === "search" || coords?.source === "saved") {
      setLoading(false);
      return;
    }
    requestLocation();
  }, [coords?.source, requestLocation]);

  return {
    coords,
    error,
    loading,
    retry: requestLocation,
    setLocation: applyLocation,
  };
}
