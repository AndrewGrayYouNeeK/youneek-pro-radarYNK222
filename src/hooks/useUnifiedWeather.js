import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { bundleOpenMeteo, enrichWithWeatherKit, isMissingWeatherKit } from "@/lib/api/unifiedWeather";
import { fetchWeatherKit } from "@/lib/api/weatherkit";
import { fetchOpenMeteo } from "@/lib/weather/openmeteo";
import useWeatherLocation from "@/hooks/useWeatherLocation";

export function unifiedWeatherKey(lat, lon) {
  return ["open-meteo-forecast", lat, lon];
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

  const openMeteoQuery = useQuery({
    queryKey: unifiedWeatherKey(lat, lon),
    enabled: Boolean(coords),
    staleTime: 180000,
    refetchInterval: 600000,
    retry: 1,
    queryFn: async () => bundleOpenMeteo(await fetchOpenMeteo(lat, lon)),
  });

  const weatherKitQuery = useQuery({
    queryKey: ["weatherkit-forecast", lat, lon],
    enabled: Boolean(coords),
    staleTime: 180000,
    refetchInterval: 600000,
    retry: false,
    queryFn: async () => {
      try {
        return await fetchWeatherKit(lat, lon);
      } catch (error) {
        if (isMissingWeatherKit(error)) return null;
        return null;
      }
    },
  });

  const data = useMemo(() => {
    if (openMeteoQuery.data && weatherKitQuery.data) {
      return enrichWithWeatherKit(openMeteoQuery.data, weatherKitQuery.data);
    }
    if (openMeteoQuery.data) return openMeteoQuery.data;
    if (weatherKitQuery.data) return enrichWithWeatherKit(null, weatherKitQuery.data);
    return undefined;
  }, [openMeteoQuery.data, weatherKitQuery.data]);

  return {
    coords,
    locationError,
    locationLoading,
    retry,
    setLocation,
    label,
    gpsStatus,
    data,
    error: data ? null : openMeteoQuery.error,
    isLoading: openMeteoQuery.isLoading && !data,
    isFetching: openMeteoQuery.isFetching,
    refetch: openMeteoQuery.refetch,
    current: data?.current?.current || null,
    today: data?.current?.daily || null,
    hourly: data?.hourly || [],
    daily: data?.daily || [],
    extras: data?.extras || null,
    source: data?.source || null,
  };
}
