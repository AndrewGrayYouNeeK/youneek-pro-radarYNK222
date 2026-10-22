import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useUnifiedWeather from "@/hooks/useUnifiedWeather";
import { fetchPointAlerts } from "@/lib/api/outlook";
import { readSafetyPreview } from "@/lib/safety/safetyPreview";
import { activeSafetyAlerts } from "@/lib/safety/weatherEmergency";

export default function useSafetyTexts() {
  const { coords, data } = useUnifiedWeather();
  const alertsQuery = useQuery({
    queryKey: ["point-alerts", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords),
    staleTime: 120000,
    queryFn: () => fetchPointAlerts(coords.latitude, coords.longitude),
  });
  const [preview] = useState(() =>
    typeof window === "undefined" ? null : readSafetyPreview(window.location.search)
  );

  const alerts = useMemo(
    () =>
      activeSafetyAlerts([
        ...(preview ? [preview] : []),
        ...(alertsQuery.data?.alerts || []),
        ...(data?.alerts || []),
      ]),
    [alertsQuery.data, data?.alerts, preview]
  );

  return {
    alerts,
    coords,
    show: alerts.length > 0,
    primary: alerts[0] || null,
  };
}
