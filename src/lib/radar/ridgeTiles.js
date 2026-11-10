export const NATIONAL_MOSAIC_ID = "MOSAIC";
export const NATIONAL_MOSAIC_URL =
  "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png";

export const RIDGE_PRODUCTS = {
  reflectivity: { code: "N0Q", label: "Reflectivity" },
  velocity: { code: "N0U", label: "Base velocity" },
  stormRelative: { code: "N0S", label: "Storm-relative" },
};

const RIDGE_ROOT = "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0";

export function ridgeTileUrl(site, productId = "reflectivity") {
  const product = RIDGE_PRODUCTS[productId] || RIDGE_PRODUCTS.reflectivity;
  const resolvedId = RIDGE_PRODUCTS[productId] ? productId : "reflectivity";
  const station = resolveRadarSite(site, resolvedId);
  if (station === NATIONAL_MOSAIC_ID) return NATIONAL_MOSAIC_URL;
  const codeSite = String(station).replace(/[^A-Za-z0-9]/g, "").toUpperCase() || "KTLX";
  return `${RIDGE_ROOT}/ridge::${codeSite}-${product.code}-0/{z}/{x}/{y}.png`;
}

export function resolveRadarSite(station, productId = "reflectivity", fallback = "KTLX") {
  if (station === NATIONAL_MOSAIC_ID && productId !== "reflectivity") return fallback || "KTLX";
  return station || NATIONAL_MOSAIC_ID;
}

export function ridgeProductLabel(site, productId = "reflectivity") {
  const product = RIDGE_PRODUCTS[productId] || RIDGE_PRODUCTS.reflectivity;
  if (site === NATIONAL_MOSAIC_ID && (productId === "reflectivity" || !RIDGE_PRODUCTS[productId])) return "National N0Q mosaic";
  const station = String(resolveRadarSite(site, productId)).replace(/[^A-Za-z0-9]/g, "").toUpperCase() || "KTLX";
  return `Showing ${station} ${product.code}`;
}
