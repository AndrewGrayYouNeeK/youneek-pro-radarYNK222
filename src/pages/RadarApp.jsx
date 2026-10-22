import { Navigate } from "react-router-dom";

/** Older launch links land on the weather home. */
export default function RadarApp() {
  return <Navigate to="/" replace />;
}
