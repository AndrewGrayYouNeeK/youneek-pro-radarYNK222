/**
 * Archived Hurricane Harvey replay for the demo overlay only.
 * Nothing here is fetched or drawn unless demo=hurricane is on.
 *
 * Reflectivity: IEM N0Q composite WMS-T at landfall, 2017-08-26 03:00 UTC.
 * Velocity: IEM RIDGE archive, KCRP N0U volume scan 2017-08-26 03:01 UTC.
 * Warning zones: IEM VTEC county/zone archive valid at 03:00 UTC.
 */

import { HARVEY_WARNING_COLLECTION } from "./harveyWarnings.js";

export const DEMO_FEATURE_ID = "demo-hurricane-warning";

/** Eye of Harvey on the 03:00 UTC N0Q mosaic, just south of Rockport. */
export const STORM_CENTER = { lat: 27.97, lon: -97.0 };

export const HARVEY_REFLECTIVITY_TIME = "2017-08-26T03:00:00Z";
export const HARVEY_VELOCITY_SCAN = "0301";
export const HARVEY_REPLAY_LABEL = "Hurricane Harvey · 10 PM CDT Aug 25, 2017 · replay";

export const N0Q_WMS_URL = "https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0q-t.cgi";
export const RIDGE_WMS_URL = "https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/ridge.cgi";

export const DEMO_CAMERAS = {
  overview: { lat: 28.2, lon: -96.85, zoom: 7 },
  eye: { lat: 27.97, lon: -97.0, zoom: 9 },
  alert: { lat: 28.35, lon: -96.75, zoom: 6.5 },
  velocity: { lat: 27.97, lon: -97.0, zoom: 8.5 },
};

/** Same weight and fill as the live NWS warning painter. Color is the NWS hurricane red from the archive. */
export const WARNING_POLYGON_STYLE = {
  color: "#DC143C",
  weight: 2,
  opacity: 0.95,
  fillColor: "#DC143C",
  fillOpacity: 0.16,
};

export function reflectivityWmsParams() {
  return {
    layers: "nexrad-n0q-wmst",
    format: "image/png",
    transparent: true,
    version: "1.1.1",
    time: HARVEY_REFLECTIVITY_TIME,
  };
}

export function velocityWmsParams() {
  return {
    layers: "single-archive",
    format: "image/png",
    transparent: true,
    version: "1.1.1",
    sector: "CRP",
    prod: "N0U",
    year: "2017",
    month: "08",
    day: "26",
    time: HARVEY_VELOCITY_SCAN,
  };
}

export function harveyWarningCollection() {
  return HARVEY_WARNING_COLLECTION;
}

export function demoBannerAlert() {
  return {
    id: DEMO_FEATURE_ID,
    name: "Hurricane Warning",
    severity: "Extreme",
    source: HARVEY_REPLAY_LABEL,
  };
}

export function demoHurricaneFeature() {
  return {
    type: "Feature",
    id: DEMO_FEATURE_ID,
    properties: {
      id: DEMO_FEATURE_ID,
      ynkDemo: "hurricane",
      event: "Hurricane Warning",
      headline: "Hurricane Harvey replay — Hurricane Warning remains in effect",
      description:
        "Historical replay, not a live warning. NWS Corpus Christi local statement at 7:09 PM CDT Fri Aug 25 2017, valid during the 03:00 UTC 26 Aug 2017 radar scan. Hurricane Warning remains in effect. Storm Surge Warning remains in effect. Locations affected include Port Lavaca, Port O'Connor, and Seadrift. Latest local forecast: equivalent Category 3 hurricane-force wind, peak 90-110 mph with gusts to 130 mph. Current threat to life and property: Extreme.",
      instruction:
        "This is an archived replay of Hurricane Harvey for screenshots. It is not a current National Weather Service warning.",
      areaDesc: "Texas coast from the Coastal Bend through the upper coast, NWS CRP, HGX, BRO, and EWX",
      expires: "2017-08-26T18:01:00Z",
      severity: "Extreme",
      senderName: "NWS Corpus Christi",
    },
  };
}

export function isDemoHurricaneFeature(feature) {
  if (!feature) return false;
  if (feature.id === DEMO_FEATURE_ID) return true;
  return feature.properties?.ynkDemo === "hurricane" || feature.properties?.id === DEMO_FEATURE_ID;
}

export function withDemoHurricaneFeature(payload) {
  const base = payload && typeof payload === "object" ? payload : {};
  const existing = Array.isArray(base.features) ? base.features.filter((feature) => !isDemoHurricaneFeature(feature)) : [];
  return {
    ...base,
    type: "FeatureCollection",
    features: [...existing, demoHurricaneFeature()],
    error: undefined,
  };
}

/** Drop the replay warning before it is written to ynk-alerts-v1. */
export function stripDemoHurricaneFromCache(raw) {
  if (typeof raw !== "string" || !raw.includes(DEMO_FEATURE_ID)) return raw;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return raw;
  }
  const collection = parsed?.data;
  if (!collection || !Array.isArray(collection.features)) return raw;
  const features = collection.features.filter((feature) => !isDemoHurricaneFeature(feature));
  if (features.length === collection.features.length) return raw;
  return JSON.stringify({ ...parsed, data: { ...collection, features } });
}

export function isAlertsCollectionUrl(url) {
  try {
    const parsed = new URL(String(url || ""), "http://localhost");
    return parsed.pathname.endsWith("/api/alerts") && parsed.searchParams.get("type") === "all";
  } catch {
    return false;
  }
}
