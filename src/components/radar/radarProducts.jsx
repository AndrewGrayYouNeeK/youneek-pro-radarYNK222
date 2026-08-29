export const RADAR_PRODUCTS = [
  {
    id: "reflectivity",
    label: "Reflectivity",
    description: "NEXRAD base reflectivity (N0Q)",
    tileUrl: "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-N0Q-0/{z}/{x}/{y}.png",
    opacity: 0.8,
    maxNativeZoom: 12,
  },
];

export function getRadarProduct(productId) {
  return RADAR_PRODUCTS.find((product) => product.id === productId) || RADAR_PRODUCTS[0];
}