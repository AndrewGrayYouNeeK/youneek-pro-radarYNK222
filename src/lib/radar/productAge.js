import { NATIONAL_MOSAIC_ID } from "./ridgeTiles.js";

const LIST_URL = "https://mesonet.agron.iastate.edu/json/radar.py";

export function scanTargets(station, productId = "reflectivity") {
  if (!station || station === NATIONAL_MOSAIC_ID) {
    return [{ radar: "USCOMP", product: "N0Q" }];
  }
  const code = String(station).replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const radar = code.startsWith("K") && code.length === 4 ? code.slice(1) : code;
  const primary = productId === "stormRelative" ? "N0S" : productId === "velocity" ? "N0U" : "N0B";
  const targets = [{ radar, product: primary }];
  if (primary !== "N0B") targets.push({ radar, product: "N0B" });
  targets.push({ radar: "USCOMP", product: "N0Q" });
  return targets;
}

export function scanUnixFromPayload(payload) {
  const stamp = payload?.scans?.[0]?.ts;
  const time = Date.parse(stamp || "");
  return Number.isFinite(time) ? Math.round(time / 1000) : null;
}

export async function latestProductScanUnix(station, productId = "reflectivity", fetchImpl = globalThis.fetch) {
  for (const target of scanTargets(station, productId)) {
    try {
      const response = await fetchImpl(`${LIST_URL}?operation=list&radar=${target.radar}&product=${target.product}`);
      if (!response?.ok) continue;
      const time = scanUnixFromPayload(await response.json());
      if (time) return time;
    } catch {
      /* Try the next product. A missing scan should not blank the map. */
    }
  }
  return null;
}
