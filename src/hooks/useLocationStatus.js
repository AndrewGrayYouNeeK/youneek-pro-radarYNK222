import { useCallback, useEffect, useRef, useState } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { useLocation } from "@/lib/LocationContext";
import { openLocationSettings } from "@/lib/native/openExternal";
import { isNativePlatform } from "@/lib/native/runtime";
import { readLocationPermission, requestLocationPermission } from "@/lib/location/locationPermission";
import {
  locationIsOff,
  locationPromptAction,
  servicesOffInstructions,
  webLocationInstructions,
} from "@/lib/location/locationPrompt";

export default function useLocationStatus({ onGranted } = {}) {
  const { gpsStatus, detectGPS } = useLocation();
  const [state, setState] = useState({ permission: "unknown", servicesOff: false, native: false, platform: "web" });
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    const next = await readLocationPermission();
    if (!mounted.current) return next;
    setState(next);
    if (next.permission === "granted" && !next.servicesOff) setNote("");
    return next;
  }, []);

  useEffect(() => {
    mounted.current = true;
    refresh();
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    let resumeHandle = null;
    if (isNativePlatform()) {
      CapacitorApp.addListener("resume", () => refresh())
        .then((handle) => {
          resumeHandle = handle;
        })
        .catch(() => {});
    }
    return () => {
      mounted.current = false;
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      resumeHandle?.remove?.();
    };
  }, [refresh]);

  // A GPS fix or a denial from the location provider means the permission changed.
  useEffect(() => {
    if (gpsStatus === "ok" || gpsStatus === "denied") refresh();
  }, [gpsStatus, refresh]);

  const off = locationIsOff({ ...state, gpsStatus: gpsStatus === "locating" ? "" : gpsStatus });
  // Do not flash the prompt while the first location request is still on screen.
  const settled = !(state.permission === "prompt" && gpsStatus === "locating");

  const turnOn = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const current = await refresh();
      const action = locationPromptAction(current);
      if (action === "settings") {
        const result = await openLocationSettings();
        setNote(current.servicesOff ? servicesOffInstructions(current.platform) : result.message);
        return;
      }
      if (action === "instructions") {
        setNote(webLocationInstructions(typeof navigator === "undefined" ? "" : navigator.userAgent));
        return;
      }
      const permission = await requestLocationPermission();
      if (permission === "granted") {
        setNote("");
        detectGPS?.().catch(() => {});
        onGranted?.();
      } else if (current.native) {
        setNote("Location is still off. Tap Turn On Location again to open Settings.");
      } else {
        setNote(webLocationInstructions(typeof navigator === "undefined" ? "" : navigator.userAgent));
      }
      await refresh();
    } finally {
      if (mounted.current) setBusy(false);
    }
  }, [busy, detectGPS, onGranted, refresh]);

  return { off: off && settled, state, note, busy, turnOn, refresh };
}
