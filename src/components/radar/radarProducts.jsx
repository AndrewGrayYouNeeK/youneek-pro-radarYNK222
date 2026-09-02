export const RADAR_PRODUCTS = [
  {
    id: "reflectivity",
    label: "Reflectivity",
    description: "NEXRAD base reflectivity (N0Q)",
    tileUrl: "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png",
    opacity: 0.8,
    maxNativeZoom: 12,
  },
  {
    id: "velocity",
    label: "Velocity",
    description: "NEXRAD base velocity (N0U)",
    tileUrl: "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0u-900913/{z}/{x}/{y}.png",
    opacity: 0.75,
    maxNativeZoom: 12,
  },
  {
    id: "global",
    label: "Global radar",
    description: "Worldwide mosaic and future nowcast",
    tileUrl: "https://tilecache.rainviewer.com/v2/radar/0/256/{z}/{x}/{y}/2/1_1.png",
    opacity: 0.78,
    maxNativeZoom: 7,
  },
];

export function getRadarProduct(productId) {
  return RADAR_PRODUCTS.find((product) => product.id === productId) || RADAR_PRODUCTS[0];
}
