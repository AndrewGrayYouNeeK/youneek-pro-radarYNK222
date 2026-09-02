export const WEATHER_CAMERAS = [
  {
    id: "goes-east",
    name: "GOES East GeoColor",
    region: "Atlantic / CONUS",
    lat: 25,
    lon: -75,
    image: "https://cdn.star.nesdis.noaa.gov/GOES16/ABI/CONUS/GEOCOLOR/latest.jpg",
    kind: "satellite",
  },
  {
    id: "goes-west",
    name: "GOES West GeoColor",
    region: "Pacific / West CONUS",
    lat: 38,
    lon: -120,
    image: "https://cdn.star.nesdis.noaa.gov/GOES18/ABI/CONUS/GEOCOLOR/latest.jpg",
    kind: "satellite",
  },
  {
    id: "goes-full-disk",
    name: "GOES East Full Disk",
    region: "Western Hemisphere",
    lat: 0,
    lon: -75,
    image: "https://cdn.star.nesdis.noaa.gov/GOES16/ABI/FD/GEOCOLOR/latest.jpg",
    kind: "satellite",
  },
  {
    id: "goes-ne",
    name: "Northeast sector",
    region: "New England / Mid-Atlantic",
    lat: 42,
    lon: -72,
    image: "https://cdn.star.nesdis.noaa.gov/GOES16/ABI/SECTOR/ne/GEOCOLOR/latest.jpg",
    kind: "satellite",
  },
  {
    id: "goes-umv",
    name: "Upper Mississippi Valley",
    region: "Midwest",
    lat: 42,
    lon: -92,
    image: "https://cdn.star.nesdis.noaa.gov/GOES16/ABI/SECTOR/umv/GEOCOLOR/latest.jpg",
    kind: "satellite",
  },
  {
    id: "goes-smv",
    name: "Southern Mississippi Valley",
    region: "South / Gulf Coast",
    lat: 32,
    lon: -90,
    image: "https://cdn.star.nesdis.noaa.gov/GOES16/ABI/SECTOR/smv/GEOCOLOR/latest.jpg",
    kind: "satellite",
  },
  {
    id: "goes-sp",
    name: "Southern Plains",
    region: "Texas / Oklahoma",
    lat: 32,
    lon: -99,
    image: "https://cdn.star.nesdis.noaa.gov/GOES16/ABI/SECTOR/sp/GEOCOLOR/latest.jpg",
    kind: "satellite",
  },
  {
    id: "goes-taw",
    name: "Tropical Atlantic",
    region: "Hurricane alley",
    lat: 20,
    lon: -55,
    image: "https://cdn.star.nesdis.noaa.gov/GOES16/ABI/SECTOR/taw/GEOCOLOR/latest.jpg",
    kind: "satellite",
  },
  {
    id: "goes-np",
    name: "Northern Pacific",
    region: "Pacific Northwest / Alaska approaches",
    lat: 48,
    lon: -135,
    image: "https://cdn.star.nesdis.noaa.gov/GOES18/ABI/SECTOR/np/GEOCOLOR/latest.jpg",
    kind: "satellite",
  },
  {
    id: "goes-psw",
    name: "Pacific Southwest",
    region: "California / Southwest",
    lat: 34,
    lon: -118,
    image: "https://cdn.star.nesdis.noaa.gov/GOES18/ABI/SECTOR/psw/GEOCOLOR/latest.jpg",
    kind: "satellite",
  },
  {
    id: "nws-ridge",
    name: "NWS CONUS radar mosaic",
    region: "Continental U.S.",
    lat: 39.5,
    lon: -98.35,
    image: "https://radar.weather.gov/ridge/standard/CONUS_0.gif",
    kind: "radar",
  },
];

function haversineMi(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function camerasNear(coords, limit = 8) {
  if (!coords) return WEATHER_CAMERAS.slice(0, limit);
  return [...WEATHER_CAMERAS]
    .map((camera) => ({
      ...camera,
      distanceMi: haversineMi(coords.latitude, coords.longitude, camera.lat, camera.lon),
    }))
    .sort((a, b) => a.distanceMi - b.distanceMi)
    .slice(0, limit);
}
