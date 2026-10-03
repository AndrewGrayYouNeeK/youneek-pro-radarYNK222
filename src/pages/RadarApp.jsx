import { Navigate } from "react-router-dom";
import { isLocalHost, WEATHER_APP_ORIGIN } from "@/lib/weatherApp";

/** /app is the landing CTA. Production opens youneekproradar.com. */
export default function RadarApp() {
  if (typeof window !== "undefined" && !isLocalHost()) {
    window.location.replace(`${WEATHER_APP_ORIGIN}/`);
    return null;
  }
  return <Navigate to="/Radar" replace />;
}
