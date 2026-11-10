import { Geolocation } from "@capacitor/geolocation";
import { isNativePlatform } from "@/lib/native/runtime";

function geolocationError(error) {
  const message = String(error?.message || error || "Location unavailable");
  const codeText = String(error?.code || "");
  const denied = /denied|restricted|OS-PLUG-GLOC-0003|OS-PLUG-GLOC-0008/i.test(`${message} ${codeText}`);
  return {
    code: denied ? 1 : 2,
    message,
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
  };
}

function toWebPosition(position) {
  const coords = position?.coords || {};
  return {
    coords: {
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy ?? null,
      altitude: coords.altitude ?? null,
      altitudeAccuracy: coords.altitudeAccuracy ?? null,
      heading: coords.heading ?? null,
      speed: coords.speed ?? null,
    },
    timestamp: position?.timestamp || Date.now(),
  };
}

let permissionRequest = null;

async function ensureWhenInUsePermission() {
  if (!permissionRequest) {
    permissionRequest = (async () => {
      const status = await Geolocation.checkPermissions();
      if (status?.location === "granted") return "granted";
      if (status?.location === "denied") return "denied";
      const next = await Geolocation.requestPermissions({ permissions: ["location"] });
      return next?.location || "denied";
    })().finally(() => {
      permissionRequest = null;
    });
  }
  return permissionRequest;
}

async function nativeGetCurrentPosition(success, error, options) {
  try {
    const permission = await ensureWhenInUsePermission();
    if (permission !== "granted") {
      error?.(geolocationError({ message: "Location permission request was denied.", code: "OS-PLUG-GLOC-0003" }));
      return;
    }
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: options?.enableHighAccuracy !== false,
      timeout: options?.timeout ?? 20000,
      maximumAge: options?.maximumAge ?? 10000,
    });
    success?.(toWebPosition(position));
  } catch (err) {
    error?.(geolocationError(err));
  }
}

const watches = new Map();

function nativeWatchPosition(success, error, options) {
  const localId = `ynk-watch-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const record = { cancelled: false, nativeId: "" };
  watches.set(localId, record);

  ensureWhenInUsePermission()
    .then((permission) => {
      if (record.cancelled) return null;
      if (permission !== "granted") {
        error?.(geolocationError({ message: "Location permission request was denied.", code: "OS-PLUG-GLOC-0003" }));
        return null;
      }
      return Geolocation.watchPosition(
        {
          enableHighAccuracy: options?.enableHighAccuracy !== false,
          timeout: options?.timeout ?? 20000,
          maximumAge: options?.maximumAge ?? 15000,
        },
        (position, err) => {
          if (record.cancelled) return;
          if (err) error?.(geolocationError(err));
          else if (position) success?.(toWebPosition(position));
        }
      );
    })
    .then((nativeId) => {
      if (!nativeId) return;
      record.nativeId = nativeId;
      if (record.cancelled) {
        Geolocation.clearWatch({ id: nativeId }).catch(() => {});
      }
    })
    .catch((err) => {
      if (!record.cancelled) error?.(geolocationError(err));
    });

  return localId;
}

function nativeClearWatch(localId) {
  const record = watches.get(localId);
  if (!record) return;
  record.cancelled = true;
  watches.delete(localId);
  if (record.nativeId) {
    Geolocation.clearWatch({ id: record.nativeId }).catch(() => {});
  }
}

export function installNativeGeolocation() {
  if (!isNativePlatform() || typeof navigator === "undefined" || !navigator.geolocation) return;
  const geo = navigator.geolocation;
  try {
    geo.getCurrentPosition = nativeGetCurrentPosition;
    geo.watchPosition = nativeWatchPosition;
    geo.clearWatch = nativeClearWatch;
  } catch {
    /* The webview geolocation object is not writable here. */
  }
}
