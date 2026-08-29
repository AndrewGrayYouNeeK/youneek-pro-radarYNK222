import { Navigate } from "react-router-dom";

/** /app is the landing CTA. Send it to the live radar product. */
export default function RadarApp() {
  return <Navigate to="/Radar" replace />;
}
