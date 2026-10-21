import { useMemo } from "react";
import { resolveEmergencyState } from "@/lib/safety/weatherEmergency";

const EMPTY_ALERTS = [];

export default function useWeatherEmergency(alerts = EMPTY_ALERTS) {
  return useMemo(() => resolveEmergencyState(alerts), [alerts]);
}
