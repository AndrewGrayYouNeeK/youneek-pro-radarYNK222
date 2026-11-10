import { Share } from "@capacitor/share";
import { isNativePlatform } from "./runtime.js";

export function openExternalUrl(url) {
  if (typeof document === "undefined") return false;
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  return true;
}

export async function openLocationSettings() {
  if (!isNativePlatform()) {
    return {
      opened: false,
      message: "Allow location for this site in the browser, then tap Use my GPS. You can also search for a city or ZIP.",
    };
  }
  openExternalUrl("app-settings:");
  return {
    opened: true,
    message: "If Settings did not open, go to Settings → YouNeeK Pro Radar → Location → While Using the App.",
  };
}

export async function shareSafetyMessage(body) {
  if (!isNativePlatform()) return false;
  await Share.share({
    title: "YouNeeK Pro Radar",
    text: body,
    dialogTitle: "Send this safety message yourself",
  });
  return true;
}
