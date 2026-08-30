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
    id: "old-faithful",
    name: "Old Faithful",
    region: "Yellowstone NP",
    lat: 44.4605,
    lon: -110.8281,
    image: "https://www.nps.gov/webcams-yell/oldfaithful.jpg",
    kind: "webcam",
  },
  {
    id: "mammoth",
    name: "Mammoth Hot Springs",
    region: "Yellowstone NP",
    lat: 44.9769,
    lon: -110.701,
    image: "https://www.nps.gov/webcams-yell/mammoth.jpg",
    kind: "webcam",
  },
  {
    id: "grand-canyon",
    name: "Grand Canyon Yavapai",
    region: "Arizona",
    lat: 36.065,
    lon: -112.118,
    image: "https://www.nps.gov/webcams-grca/yavapai.jpg",
    kind: "webcam",
  },
  {
    id: "denali",
    name: "Denali Eielson",
    region: "Alaska",
    lat: 63.4308,
    lon: -150.31,
    image: "https://www.nps.gov/webcams-dena/eielson.jpg",
    kind: "webcam",
  },
  {
    id: "acadia",
    name: "Acadia Cadillac",
    region: "Maine",
    lat: 44.351,
    lon: -68.226,
    image: "https://www.nps.gov/webcams-acad/cadillac.jpg",
    kind: "webcam",
  },
  {
    id: "hawaii-volcano",
    name: "Kilauea Overlook",
    region: "Hawaiʻi",
    lat: 19.4069,
    lon: -155.2834,
    image: "https://www.nps.gov/webcams-havo/k2cam.jpg",
    kind: "webcam",
  },
  {
    id: "mt-rainier",
    name: "Paradise Inn",
    region: "Mount Rainier",
    lat: 46.786,
    lon: -121.735,
    image: "https://www.nps.gov/webcams-mora/paradise.jpg",
    kind: "webcam",
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
