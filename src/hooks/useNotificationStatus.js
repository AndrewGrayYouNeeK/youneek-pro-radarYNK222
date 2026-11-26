import { useCallback, useEffect, useRef, useState } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { isNativePlatform } from "@/lib/native/runtime";
import {
  openNotificationSettings,
  readNotifyPermission,
  requestNotifyPermission,
} from "@/lib/native/pushAlerts";

/** Notification permission for live warnings (native only). Re-reads on resume from Settings. */
export default function useNotificationStatus() {
  const native = isNativePlatform();
  const [permission, setPermission] = useState("unknown");
  const [busy, setBusy] = useState(false);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    const next = await readNotifyPermission();
    if (mounted.current) setPermission(next);
    return next;
  }, []);

  useEffect(() => {
    mounted.current = true;
    if (!native) return undefined;
    refresh();
    let handle = null;
    CapacitorApp.addListener("resume", () => refresh())
      .then((value) => {
        handle = value;
      })
      .catch(() => {});
    return () => {
      mounted.current = false;
      handle?.remove?.();
    };
  }, [native, refresh]);

  const turnOn = useCallback(async () => {
    setBusy(true);
    try {
      const current = await readNotifyPermission();
      if (current === "denied") {
        openNotificationSettings();
        return current;
      }
      const next = await requestNotifyPermission();
      if (mounted.current) setPermission(next);
      return next;
    } finally {
      if (mounted.current) setBusy(false);
    }
  }, []);

  return { native, permission, off: native && permission === "denied", busy, turnOn, refresh };
}
