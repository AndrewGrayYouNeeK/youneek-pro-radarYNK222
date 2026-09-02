import { useQuery } from "@tanstack/react-query";
import { fetchUnifiedWeather } from "@/lib/api/unifiedWeather";
import useWeatherLocation from "@/hooks/useWeatherLocation";

export function unifiedWeatherKey(lat, lon) {
  return ["unified-weather", lat, lon];
}

export default function useUnifiedWeather() {
  const {
    coords,
    error: locationError,
    loading: locationLoading,
    retry,
    setLocation,
    label,
    gpsStatus,
  } = useWeatherLocation();

  const lat = coords?.latitude;
  const lon = coords?.longitude;

  const query = useQuery({
    queryKey: unifiedWeatherKey(lat, lon),
    enabled: Boolean(coords),
    staleTime: 180000,
    refetchInterval: 600000,
    retry: 2,
    queryFn: () => fetchUnifiedWeather(lat, lon),
  });

  return {
    coords,
    locationError,
    locationLoading,
    retry,
    setLocation,
    label,
    gpsStatus,
    data: query.data,
    error: query.error,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
    current: query.data?.current?.current || null,
    today: query.data?.current?.daily || null,
    hourly: query.data?.hourly || [],
    daily: query.data?.daily || [],
    extras: query.data?.extras || null,
    source: query.data?.source || null,
  };
}
