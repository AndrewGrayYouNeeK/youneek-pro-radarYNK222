import { NWR_LISTING_URL, parseCclPayload } from "./stations.js";

const CACHE_KEY = "nwr_transmitters_v1";

function readCache() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCache(stations) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(stations));
  } catch {
    /* ignore quota */
  }
}

export async function loadNwrTransmitters(fetchImpl = globalThis.fetch) {
  const cached = typeof localStorage === "undefined" ? [] : readCache();
  try {
    const response = await fetchImpl(NWR_LISTING_URL);
    if (!response?.ok) throw new Error("NWR listing unavailable");
    const stations = parseCclPayload(await response.text());
    if (!stations.length) throw new Error("NWR listing was empty");
    if (typeof localStorage !== "undefined") writeCache(stations);
    return { stations, fromCache: false };
  } catch (error) {
    if (cached.length) return { stations: cached, fromCache: true };
    throw error;
  }
}
