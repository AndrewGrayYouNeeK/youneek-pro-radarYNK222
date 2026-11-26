import { useEffect, useRef } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { useLocation } from "@/lib/LocationContext";
import { fetchNwsPointAlerts } from "@/lib/api/nwsAlerts";
import { isNativePlatform } from "@/lib/native/runtime";
import {
  installNotificationTaps,
  notifyNewWarningsLocally,
  syncPushRegistration,
} from "@/lib/native/pushAlerts";

const LOCAL_POLL_MS = 2 * 60 * 1000;

/**
 * Native only, renders nothing. Keeps this phone registered for closed-app warning pushes
 * (token + ~11 km cell), and while the app is open shows local notifications for new
 * warnings when server push is not set up.
 */
export default function LiveAlerts({ paused = false }) {
  const { location } = useLocation();
  const native = isNativePlatform();
  const lat = location?.lat;
  const lon = location?.lon;
  const latest = useRef({ lat, lon });
  latest.current = { lat, lon };

  useEffect(() => {
    if (native) installNotificationTaps();
  }, [native]);

  useEffect(() => {
    if (!native || paused || lat == null || lon == null) return undefined;
    syncPushRegistration({ lat, lon }).catch(() => {});
    let handle = null;
    CapacitorApp.addListener("resume", () => {
      syncPushRegistration(latest.current).catch(() => {});
    })
      .then((value) => {
        handle = value;
      })
      .catch(() => {});
    return () => handle?.remove?.();
  }, [native, paused, lat, lon]);

  useEffect(() => {
    if (!native || paused || lat == null || lon == null) return undefined;
    let stopped = false;
    const check = async () => {
      if (stopped || document.visibilityState === "hidden") return;
      const alerts = await fetchNwsPointAlerts(lat, lon).catch(() => []);
      if (!stopped) await notifyNewWarningsLocally(alerts).catch(() => {});
    };
    check();
    const timer = setInterval(check, LOCAL_POLL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [native, paused, lat, lon]);

  return null;
}
