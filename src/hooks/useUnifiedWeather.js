import { useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { bundleOpenMeteo, enrichWithWeatherKit, isMissingWeatherKit } from "@/lib/api/unifiedWeather";
import { fetchWeatherKit } from "@/lib/api/weatherkit";
import { fetchOpenMeteo } from "@/lib/weather/openmeteo";
import useWeatherLocation from "@/hooks/useWeatherLocation";
import { weatherQueryCoords } from "@/lib/locationStability";
import { readCachedJson, writeCachedJson } from "@/lib/offlineCache";

export function unifiedWeatherKey(lat, lon) {
  return ["open-meteo-forecast", ...weatherQueryCoords(lat, lon)];
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

  const [roundedLat, roundedLon] = weatherQueryCoords(lat, lon);

  const openMeteoQuery = useQuery({
    queryKey: unifiedWeatherKey(lat, lon),
    enabled: Boolean(coords),
    placeholderData: keepPreviousData,
    staleTime: 180000,
    refetchInterval: 600000,
    retry: 1,
    queryFn: async () => {
      const cacheKey = `ynk-forecast-${roundedLat}-${roundedLon}`;
      try {
        const data = bundleOpenMeteo(await fetchOpenMeteo(roundedLat, roundedLon));
        writeCachedJson(cacheKey, data);
        return data;
      } catch (error) {
        const cached = readCachedJson(cacheKey);
        if (cached) return { ...cached, offlineSnapshot: true };
        throw error;
      }
    },
  });

  const weatherKitQuery = useQuery({
    queryKey: ["weatherkit-forecast", roundedLat, roundedLon],
    enabled: Boolean(coords),
    placeholderData: keepPreviousData,
    staleTime: 180000,
    refetchInterval: 600000,
    retry: false,
    queryFn: async () => {
      try {
        return await fetchWeatherKit(roundedLat, roundedLon);
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
