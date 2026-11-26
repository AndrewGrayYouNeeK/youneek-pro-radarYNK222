// Live NWS warning notifications on iOS and Android.
// Server push (APNs / FCM) works with the app closed. Local notifications are the fallback
// while the app is open and server push is not set up yet.
import { Capacitor, registerPlugin } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { PushNotifications } from "@capacitor/push-notifications";
import { isNativePlatform } from "./runtime.js";
import { openExternalUrl } from "./openExternal.js";
import {
  ANDROID_CHANNEL_ID,
  LOCAL_SENT_KEY,
  PUSH_REGISTRATION_KEY,
  coarseCell,
  localWarningNotification,
  needsRegistration,
  newLocalWarnings,
  normalizeNotifyPermission,
  parseRegistration,
  rememberNotified,
  serverPushActive,
} from "@/lib/push/pushClient";

const AppSettings = registerPlugin("AppSettings");
let channelReady = false;
let listenersReady = false;
let tokenPromise = null;

function storage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readJson(key) {
  return parseRegistration(storage()?.getItem(key));
}

function writeJson(key, value) {
  try {
    storage()?.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode */
  }
}

export function pushSupported() {
  return isNativePlatform();
}

export async function readNotifyPermission() {
  if (!isNativePlatform()) return "unknown";
  try {
    const status = await PushNotifications.checkPermissions();
    return normalizeNotifyPermission(status.receive);
  } catch {
    return "unknown";
  }
}

async function ensureChannel() {
  if (channelReady || Capacitor.getPlatform() !== "android") return;
  const channel = {
    id: ANDROID_CHANNEL_ID,
    name: "Severe weather warnings",
    description: "Tornado, Severe Thunderstorm, and Flash Flood Warnings for your area",
    importance: 5,
    visibility: 1,
    vibration: true,
    lights: true,
    lightColor: "#34D399",
  };
  try {
    await PushNotifications.createChannel(channel);
  } catch {
    /* older Android or plugin missing */
  }
  try {
    await LocalNotifications.createChannel(channel);
  } catch {
    /* same channel id; ignore */
  }
  channelReady = true;
}

/** Ask once, after safety contacts and location. Returns the permission state. */
export async function requestNotifyPermission() {
  if (!isNativePlatform()) return "unknown";
  try {
    await ensureChannel();
    const current = await readNotifyPermission();
    if (current !== "prompt") return current;
    const status = await PushNotifications.requestPermissions();
    return normalizeNotifyPermission(status.receive);
  } catch {
    return "unknown";
  }
}

export function openNotificationSettings() {
  if (!isNativePlatform()) return false;
  openExternalUrl("app-settings:");
  return true;
}

async function serverPushPossible() {
  if (Capacitor.getPlatform() !== "android") return true;
  // Without google-services.json, FCM register() crashes on Android. Skip it.
  try {
    const result = await AppSettings.pushAvailable();
    return Boolean(result?.available);
  } catch {
    return false;
  }
}

function goToRadar(route = "/Radar") {
  if (typeof window === "undefined") return;
  if (window.location.pathname !== route) window.location.assign(route);
}

export async function installNotificationTaps() {
  if (!isNativePlatform() || listenersReady) return;
  listenersReady = true;
  try {
    await PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
      goToRadar(action?.notification?.data?.route || "/Radar");
    });
    await LocalNotifications.addListener("localNotificationActionPerformed", (action) => {
      goToRadar(action?.notification?.extra?.route || "/Radar");
    });
  } catch {
    /* plugins missing in this build */
  }
}

function getDeviceToken(timeoutMs = 15000) {
  if (tokenPromise) return tokenPromise;
  tokenPromise = new Promise((resolve) => {
    let done = false;
    const handles = [];
    const finish = (value) => {
      if (done) return;
      done = true;
      handles.forEach((handle) => handle?.remove?.());
      if (!value) tokenPromise = null;
      resolve(value);
    };
    Promise.all([
      PushNotifications.addListener("registration", (token) => finish(token?.value || null)),
      PushNotifications.addListener("registrationError", () => finish(null)),
    ])
      .then((list) => {
        handles.push(...list);
        if (done) list.forEach((handle) => handle?.remove?.());
        return PushNotifications.register();
      })
      .catch(() => finish(null));
    setTimeout(() => finish(null), timeoutMs);
  });
  return tokenPromise;
}

/** Notifications were turned off: delete this phone's token and zones from the Worker. */
async function dropServerRegistration() {
  const previous = readJson(PUSH_REGISTRATION_KEY);
  if (!previous?.token) return;
  try {
    const response = await fetch("/api/push/unregister", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: previous.token }),
    });
    if (response.ok) storage()?.removeItem(PUSH_REGISTRATION_KEY);
  } catch {
    /* retry next launch; the server record also expires after 30 days */
  }
}

/**
 * Register this phone for closed-app warning pushes near the given place.
 * Sends only the push token and a ~11 km rounded location.
 */
export async function syncPushRegistration(location) {
  if (!isNativePlatform()) return { ok: false, reason: "web" };
  const cell = coarseCell(location?.lat, location?.lon);
  if (!cell) return { ok: false, reason: "no-location" };
  const permission = await readNotifyPermission();
  if (permission !== "granted") {
    if (permission === "denied") await dropServerRegistration();
    return { ok: false, reason: "permission" };
  }
  await ensureChannel();
  if (!(await serverPushPossible())) return { ok: false, reason: "no-firebase" };
  const token = await getDeviceToken();
  if (!token) return { ok: false, reason: "no-token" };
  const previous = readJson(PUSH_REGISTRATION_KEY);
  if (!needsRegistration(previous, { token, cell })) return { ok: Boolean(previous?.ok), reason: "fresh" };
  const platform = Capacitor.getPlatform() === "ios" ? "ios" : "android";
  try {
    const response = await fetch("/api/push/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, token, lat: cell.lat, lon: cell.lon, sandbox: import.meta.env?.VITE_APNS_SANDBOX === "1" }),
    });
    const ok = response.ok;
    writeJson(PUSH_REGISTRATION_KEY, { token, cell, at: Date.now(), ok });
    return { ok, reason: ok ? "registered" : `http-${response.status}` };
  } catch {
    return { ok: false, reason: "network" };
  }
}

/** While the app runs, show a local notification for new warnings if server push is not active. */
export async function notifyNewWarningsLocally(alerts) {
  if (!isNativePlatform()) return 0;
  if (serverPushActive(readJson(PUSH_REGISTRATION_KEY))) return 0;
  if ((await readNotifyPermission()) !== "granted") return 0;
  const notified = readJson(LOCAL_SENT_KEY) || [];
  const fresh = newLocalWarnings(alerts, Array.isArray(notified) ? notified : []);
  if (!fresh.length) return 0;
  await ensureChannel();
  try {
    await LocalNotifications.schedule({ notifications: fresh.map(localWarningNotification) });
  } catch {
    return 0;
  }
  writeJson(LOCAL_SENT_KEY, rememberNotified(notified, fresh.map((alert) => alert.id)));
  return fresh.length;
}
