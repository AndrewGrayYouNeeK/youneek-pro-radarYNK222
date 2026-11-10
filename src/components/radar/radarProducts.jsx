import { RIDGE_PRODUCTS, ridgeTileUrl } from "@/lib/radar/ridgeTiles";

export const RADAR_PRODUCTS = [
  {
    id: "reflectivity",
    label: RIDGE_PRODUCTS.reflectivity.label,
    code: RIDGE_PRODUCTS.reflectivity.code,
    description: "NEXRAD base reflectivity for the selected site",
  },
  {
    id: "velocity",
    label: RIDGE_PRODUCTS.velocity.label,
    code: RIDGE_PRODUCTS.velocity.code,
    description: "NEXRAD base velocity (N0U) for the selected site",
  },
  {
    id: "stormRelative",
    label: RIDGE_PRODUCTS.stormRelative.label,
    code: RIDGE_PRODUCTS.stormRelative.code,
    description: "Storm-relative velocity (N0S) for the selected site",
  },
];

export function getRadarProduct(productId) {
  return RADAR_PRODUCTS.find((product) => product.id === productId) || RADAR_PRODUCTS[0];
}

export function productTileUrl(site, productId) {
  return ridgeTileUrl(site, productId);
}
