export const RIDGE_PRODUCTS = {
  reflectivity: { code: "N0Q", label: "Reflectivity" },
  velocity: { code: "N0U", label: "Base velocity" },
  stormRelative: { code: "N0S", label: "Storm-relative" },
};

const RIDGE_ROOT = "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0";

export function ridgeTileUrl(site, productId = "reflectivity") {
  const product = RIDGE_PRODUCTS[productId] || RIDGE_PRODUCTS.reflectivity;
  const station = String(site || "KTLX").replace(/[^A-Za-z0-9]/g, "").toUpperCase() || "KTLX";
  return `${RIDGE_ROOT}/ridge::${station}-${product.code}-0/{z}/{x}/{y}.png`;
}

export function ridgeProductLabel(site, productId = "reflectivity") {
  const product = RIDGE_PRODUCTS[productId] || RIDGE_PRODUCTS.reflectivity;
  const station = String(site || "KTLX").replace(/[^A-Za-z0-9]/g, "").toUpperCase() || "KTLX";
  return `Showing ${station} ${product.code}`;
}
