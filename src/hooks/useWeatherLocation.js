import { useCallback } from "react";
import { useLocation as useAppLocation } from "@/components/landing/LocationContext";

export default function useWeatherLocation() {
  const { location, locating, gpsStatus, detectGPS, setLocation: setAppLocation } = useAppLocation();
  const coords =
    location && Number.isFinite(Number(location.lat)) && Number.isFinite(Number(location.lon))
      ? {
          latitude: Number(location.lat),
          longitude: Number(location.lon),
          label: location.label || "",
          source: location.source || "",
        }
      : null;

  let error = "";
  if (!locating && !coords) {
    if (gpsStatus === "denied") error = "Allow location or search for a city to load the forecast.";
    else if (gpsStatus === "unavailable") error = "Location services are not available on this device.";
    else error = "Set a location to load weather for your area.";
  }

  const setLocation = useCallback(
    (next) => {
      if (!next || !setAppLocation) return;
      setAppLocation({
        label: next.label || "Selected location",
        city: next.city || "",
        state: next.state || "",
        lat: Number(next.latitude ?? next.lat),
        lon: Number(next.longitude ?? next.lon),
        source: next.source || "search",
      });
    },
    [setAppLocation]
  );

  return {
    coords,
    error,
    loading: locating && !coords,
    retry: detectGPS,
    setLocation,
    label: location?.label || "",
    gpsStatus,
  };
}
