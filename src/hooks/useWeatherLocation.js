import { useLocation as useAppLocation } from "@/components/landing/LocationContext";

export default function useWeatherLocation() {
  const { location, locating, gpsStatus, detectGPS } = useAppLocation();
  const coords =
    location && Number.isFinite(Number(location.lat)) && Number.isFinite(Number(location.lon))
      ? {
          latitude: Number(location.lat),
          longitude: Number(location.lon),
          label: location.label || "",
        }
      : null;

  let error = "";
  if (!locating && !coords) {
    if (gpsStatus === "denied") error = "Allow location or search for a city to load the forecast.";
    else if (gpsStatus === "unavailable") error = "Location services are not available on this device.";
    else error = "Set a location to load weather for your area.";
  }

  return {
    coords,
    error,
    loading: locating && !coords,
    retry: detectGPS,
    label: location?.label || "",
    gpsStatus,
  };
}
