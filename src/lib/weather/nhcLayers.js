const BASIN_START = { AT: 4, EP: 134, CP: 264 };
const SLOT = 26;

export function nhcLayerIds(binNumber) {
  const match = String(binNumber || "")
    .toUpperCase()
    .match(/^(AT|EP|CP)\s*0*([1-5])$/);
  if (!match) return null;
  const start = BASIN_START[match[1]] + (Number(match[2]) - 1) * SLOT;
  return {
    forecastPoints: start + 2,
    forecastTrack: start + 3,
    cone: start + 4,
    pastTrack: start + 8,
  };
}

export function nhcQueryUrl(layerId) {
  const params = new URLSearchParams({
    where: "1=1",
    outFields: "*",
    returnGeometry: "true",
    f: "geojson",
  });
  return `https://mapservices.weather.noaa.gov/tropical/rest/services/tropical/NHC_tropical_weather/MapServer/${layerId}/query?${params.toString()}`;
}
