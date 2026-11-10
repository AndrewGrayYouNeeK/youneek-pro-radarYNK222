export function readCachedJson(key) {
  try {
    const store = globalThis.localStorage;
    if (!store) return null;
    const parsed = JSON.parse(store.getItem(key) || "null");
    if (!parsed || typeof parsed !== "object" || !("data" in parsed)) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

export function writeCachedJson(key, data) {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    /* Private mode and full storage should not block the screen. */
  }
}
