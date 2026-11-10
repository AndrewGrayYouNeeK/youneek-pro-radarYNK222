export const SPC_OUTLOOKS = {
  spc1: "https://www.spc.noaa.gov/products/outlook/day1otlk_cat.nolyr.geojson",
  spc2: "https://www.spc.noaa.gov/products/outlook/day2otlk_cat.nolyr.geojson",
  spc3: "https://www.spc.noaa.gov/products/outlook/day3otlk_cat.nolyr.geojson",
};

export const SPC_MD_URL =
  "https://mapservices.weather.noaa.gov/vector/rest/services/outlooks/spc_mesoscale_discussion/MapServer/0/query?where=1%3D1&outFields=name,popupinfo&returnGeometry=true&outSR=4326&f=geojson";

export const WPC_FRONTS_URL =
  "https://mapservices.weather.noaa.gov/vector/rest/services/outlooks/natl_fcst_wx_chart/MapServer/2/query?where=1%3D1&outFields=*&returnGeometry=true&outSR=4326&f=geojson";

export const USGS_QUAKES_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson";

export function wfigsPerimeterUrl(bounds) {
  const west = bounds.west ?? bounds.getWest?.();
  const south = bounds.south ?? bounds.getSouth?.();
  const east = bounds.east ?? bounds.getEast?.();
  const north = bounds.north ?? bounds.getNorth?.();
  const geometry = `${west},${south},${east},${north}`;
  const params = new URLSearchParams({
    where: "1=1",
    geometry,
    geometryType: "esriGeometryEnvelope",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: "poly_IncidentName,irwin_IncidentName,poly_Acres_AutoCalc",
    returnGeometry: "true",
    outSR: "4326",
    f: "geojson",
    resultRecordCount: "60",
  });
  return `https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Interagency_Perimeters_Current/FeatureServer/0/query?${params.toString()}`;
}

export function snowAnalysisUrl(bounds) {
  const west = bounds.west ?? bounds.getWest?.();
  const south = bounds.south ?? bounds.getSouth?.();
  const east = bounds.east ?? bounds.getEast?.();
  const north = bounds.north ?? bounds.getNorth?.();
  const params = new URLSearchParams({
    bbox: `${west},${south},${east},${north}`,
    bboxSR: "4326",
    imageSR: "4326",
    size: "512,512",
    format: "png32",
    transparent: "true",
    layers: "show:0",
    f: "image",
  });
  return `https://mapservices.weather.noaa.gov/raster/rest/services/snow/NOHRSC_Snow_Analysis/MapServer/export?${params.toString()}`;
}
