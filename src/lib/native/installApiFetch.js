import { resolveApiOrigin, toApiUrl } from "@/lib/native/apiBase";
import { isNativePlatform, nativeProtocol } from "@/lib/native/runtime";

export function installApiFetch() {
  if (typeof window === "undefined" || window.__ynkApiFetchInstalled) return "";
  const origin = resolveApiOrigin({
    native: isNativePlatform(),
    configured: import.meta.env?.VITE_API_BASE_URL,
    protocol: nativeProtocol(),
  });
  if (!origin) return "";

  const original = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (typeof input === "string" || input instanceof URL) {
      return original(toApiUrl(String(input), origin), init);
    }
    return original(input, init);
  };
  window.__ynkApiFetchInstalled = true;
  return origin;
}
