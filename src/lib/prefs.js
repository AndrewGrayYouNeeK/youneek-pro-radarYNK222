export function getPref(key, defaultValue = true) {
  if (typeof window === "undefined") return defaultValue;
  const value = window.localStorage.getItem(key);
  if (value === null) return defaultValue;
  return value !== "false";
}

export function setPref(key, value) {
  window.localStorage.setItem(key, String(value));
}
