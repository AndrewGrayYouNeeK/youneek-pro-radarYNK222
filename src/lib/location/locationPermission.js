import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";
import { isNativePlatform } from "@/lib/native/runtime";
import { normalizePermission } from "./locationPrompt.js";

function servicesDisabledError(error) {
  return /not enabled|disabled|services? (are|is) off|OS-PLUG-GLOC-0007|OS-PLUG-GLOC-0016/i.test(
    `${error?.message || error || ""} ${error?.code || ""}`
  );
}

// Reads permission without asking. Never starts tracking.
export async function readLocationPermission() {
  if (isNativePlatform()) {
    try {
      const status = await Geolocation.checkPermissions();
      return { permission: normalizePermission(status?.location), servicesOff: false, native: true, platform: Capacitor.getPlatform() };
    } catch (error) {
      return {
        permission: "unknown",
        servicesOff: servicesDisabledError(error),
        native: true,
        platform: Capacitor.getPlatform(),
      };
    }
  }
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return { permission: "denied", servicesOff: false, native: false, platform: "web" };
  }
  try {
    const status = await navigator.permissions?.query?.({ name: "geolocation" });
    return { permission: normalizePermission(status?.state), servicesOff: false, native: false, platform: "web" };
  } catch {
    return { permission: "unknown", servicesOff: false, native: false, platform: "web" };
  }
}

// While In Use only: Capacitor's "location" alias maps to When In Use on iOS
// (the app has no Always usage string) and to foreground location on Android.
export async function requestLocationPermission() {
  if (isNativePlatform()) {
    try {
      const next = await Geolocation.requestPermissions({ permissions: ["location"] });
      return normalizePermission(next?.location);
    } catch {
      return "denied";
    }
  }
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => resolve("granted"),
      (error) => resolve(error?.code === 1 ? "denied" : "unknown"),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  });
}
