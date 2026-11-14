import L from "leaflet";
import { isAlertsCollectionUrl, stripDemoHurricaneFromCache, withDemoHurricaneFeature } from "@/lib/demo/hurricaneField";

let active = false;
let hookInstalled = false;
let fetchPatched = false;
let capturedMap = null;
let originalFetch = null;
let originalSetItem = null;
const listeners = new Set();

function requestUrl(input) {
  if (typeof input === "string") return input;
  if (typeof URL !== "undefined" && input instanceof URL) return input.toString();
  if (input && typeof input.url === "string") return input.url;
  return "";
}

async function patchedFetch(input, init) {
  if (!active || !isAlertsCollectionUrl(requestUrl(input))) {
    return originalFetch(input, init);
  }
  try {
    const response = await originalFetch(input, init);
    const payload = await response.json().catch(() => null);
    return new Response(JSON.stringify(withDemoHurricaneFeature(payload)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify(withDemoHurricaneFeature(null)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function patchedSetItem(key, value) {
  const next = active && key === "ynk-alerts-v1" ? stripDemoHurricaneFromCache(value) : value;
  return originalSetItem.call(this, key, next);
}

function ensureHook() {
  if (hookInstalled) return;
  hookInstalled = true;
  L.Map.addInitHook(function onDemoMap() {
    if (!active) return;
    capturedMap = this;
    listeners.forEach((listener) => listener(this));
  });
}

export function subscribeDemoMap(listener) {
  listeners.add(listener);
  if (active && capturedMap) listener(capturedMap);
  return () => listeners.delete(listener);
}

/**
 * Install fetch/cache guards and a Leaflet init hook.
 * Call this before the live radar map is constructed. Returns uninstall.
 */
export function installDemoHurricane() {
  active = true;
  ensureHook();
  if (!fetchPatched && typeof window !== "undefined" && typeof window.fetch === "function") {
    originalFetch = window.fetch.bind(window);
    window.fetch = patchedFetch;
    originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = patchedSetItem;
    fetchPatched = true;
  }
  return function uninstallDemoHurricane() {
    active = false;
    capturedMap = null;
    if (!fetchPatched) return;
    window.fetch = originalFetch;
    Storage.prototype.setItem = originalSetItem;
    fetchPatched = false;
  };
}
