import { Capacitor } from "@capacitor/core";

export function isNativePlatform() {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export function nativeProtocol() {
  if (typeof window === "undefined") return "";
  return window.location?.protocol || "";
}
