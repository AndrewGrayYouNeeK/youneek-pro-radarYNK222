import { Preferences } from "@capacitor/preferences";
import { isNativePlatform } from "@/lib/native/runtime";

export async function bridgePreferences() {
  if (!isNativePlatform() || typeof window === "undefined" || !window.localStorage) return;
  const storage = window.localStorage;
  if (storage.__ynkPreferencesBridged) return;

  const cached = new Map();
  try {
    const { keys } = await Preferences.keys();
    await Promise.all(
      (keys || []).map(async (key) => {
        const { value } = await Preferences.get({ key });
        if (value != null) cached.set(key, value);
      })
    );
  } catch {
    return;
  }

  const originalGet = storage.getItem.bind(storage);
  const originalSet = storage.setItem.bind(storage);
  const originalRemove = storage.removeItem.bind(storage);
  const originalClear = storage.clear.bind(storage);

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key || cached.has(key)) continue;
    const value = originalGet(key);
    if (value == null) continue;
    cached.set(key, value);
    Preferences.set({ key, value }).catch(() => {});
  }

  cached.forEach((value, key) => {
    try {
      originalSet(key, value);
    } catch {
      /* private mode */
    }
  });

  storage.getItem = (key) => (cached.has(key) ? cached.get(key) : originalGet(key));
  storage.setItem = (key, value) => {
    const text = String(value);
    cached.set(String(key), text);
    originalSet(key, text);
    Preferences.set({ key: String(key), value: text }).catch(() => {});
  };
  storage.removeItem = (key) => {
    cached.delete(String(key));
    originalRemove(key);
    Preferences.remove({ key: String(key) }).catch(() => {});
  };
  storage.clear = () => {
    const names = [...cached.keys()];
    cached.clear();
    originalClear();
    names.forEach((key) => {
      Preferences.remove({ key }).catch(() => {});
    });
  };
  storage.__ynkPreferencesBridged = true;
}
