export const IOWA_SATELLITE = {
  visible: "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/goes-east-vis-1km/{z}/{x}/{y}.png",
  ir: "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/goes-east-ir-4km/{z}/{x}/{y}.png",
  vapor: "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/goes-east-wv-4km/{z}/{x}/{y}.png",
};

export function gibsVisibleFrames(now = new Date(), count = 4) {
  const hour = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours());
  const frames = [];
  for (let index = count - 1; index >= 0; index -= 1) {
    const time = new Date(hour - index * 3600000);
    const stamp = time.toISOString().replace(/\.\d{3}Z$/, "Z");
    frames.push({
      time: Math.floor(time.getTime() / 1000),
      tileUrl: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GOES-East_ABI_GeoColor/default/${stamp}/GoogleMapsCompatible_Level7/{z}/{y}/{x}.jpg`,
    });
  }
  return frames;
}
