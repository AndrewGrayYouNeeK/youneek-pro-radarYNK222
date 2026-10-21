export const SAFETY_PREVIEW_KEY = "ynk_safety_preview_v1";

function storageFor(storage) {
  if (storage) return storage;
  try {
    return globalThis.localStorage || null;
  } catch {
    return null;
  }
}

export function previewSafetyAlert(label = "Tornado Warning", now = Date.now()) {
  const name = String(label || "").trim() || "Tornado Warning";
  return {
    id: "preview-safety-alert",
    name,
    severity: "Extreme",
    source: "preview",
    recent: false,
    expires: new Date(now + 60 * 60 * 1000).toISOString(),
    description: "Simulated active warning for testing safety texts.",
  };
}

export function readSafetyPreview(search = "", storage, now = Date.now()) {
  const store = storageFor(storage);
  const raw = String(search || "");
  const query = raw.includes("?") ? raw.slice(raw.indexOf("?") + 1) : raw;
  const params = new URLSearchParams(query);
  if (params.has("safetyPreview")) {
    const value = (params.get("safetyPreview") || "").trim();
    const off = !value || value === "0" || value.toLowerCase() === "off" || value.toLowerCase() === "false";
    if (off) {
      try {
        store?.removeItem(SAFETY_PREVIEW_KEY);
      } catch {
        /* ignore private mode */
      }
      return null;
    }
    try {
      store?.setItem(SAFETY_PREVIEW_KEY, value);
    } catch {
      /* ignore quota */
    }
    return previewSafetyAlert(value, now);
  }
  try {
    const saved = store?.getItem(SAFETY_PREVIEW_KEY);
    if (!saved) return null;
    return previewSafetyAlert(saved, now);
  } catch {
    return null;
  }
}
