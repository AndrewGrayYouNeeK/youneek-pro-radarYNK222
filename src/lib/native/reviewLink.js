import { App } from "@capacitor/app";
import { readSafetyPreview } from "@/lib/safety/safetyPreview";
import { isNativePlatform } from "@/lib/native/runtime";

export function previewLabelFromUrl(url) {
  if (!url) return null;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.searchParams.has("safetyPreview")) {
    return parsed.searchParams.get("safetyPreview") ?? "";
  }
  const path = `${parsed.hostname}${parsed.pathname}`.toLowerCase();
  if (path.includes("safety-preview")) return "Tornado Warning";
  return null;
}

function applyReviewUrl(url) {
  const label = previewLabelFromUrl(url);
  if (label == null || typeof window === "undefined") return false;
  const marker = `ynk-review-applied:${url}`;
  try {
    if (window.sessionStorage.getItem(marker)) return false;
    window.sessionStorage.setItem(marker, "1");
  } catch {
    /* session storage can be blocked */
  }
  readSafetyPreview(`?safetyPreview=${encodeURIComponent(label)}`);
  return true;
}

export async function installReviewLink() {
  if (!isNativePlatform()) return;
  try {
    const launch = await App.getLaunchUrl();
    applyReviewUrl(launch?.url);
    await App.addListener("appUrlOpen", (event) => {
      if (applyReviewUrl(event?.url)) window.location.reload();
    });
  } catch {
    /* The review link is optional and must never block launch. */
  }
}
