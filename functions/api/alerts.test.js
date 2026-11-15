import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { ALERT_EVENTS, EVENT_LAYER, clearZoneCache, fetchEvents, fillZoneGeometry, onRequestGet, zonePolygons } from "./alerts.js";

const ZONE_A = "https://api.weather.gov/zones/forecast/COZ040";
const ZONE_B = "https://api.weather.gov/zones/county/COC031";
const square = (x) => ({ type: "Polygon", coordinates: [[[x, 40], [x + 1, 40], [x + 1, 41], [x, 41], [x, 40]]] });

function json(body, status = 200) {
  return { ok: status < 400, status, json: async () => body };
}

test("Severe Thunderstorm Warnings and Watches carry the tags the radar paints", () => {
  assert.equal(EVENT_LAYER["Severe Thunderstorm Warning"], "severe");
  assert.equal(EVENT_LAYER["Severe Thunderstorm Watch"], "severe_watch");
  assert.equal(ALERT_EVENTS.thunderstorm, undefined);
  const radar = readFileSync(new URL("../../src/components/radar/RadarDisplay.jsx", import.meta.url), "utf8");
  for (const layer of ["tornado", "tornado_watch", "severe_watch", "severe", "flood", "winter", "heat", "wind", "fire"]) {
    assert.ok(ALERT_EVENTS[layer], `server has ${layer}`);
    assert.match(radar, new RegExp(`paint\\([A-Za-z]+, "${layer}"`), `radar paints ${layer}`);
  }
});

test("?type=thunderstorm still works and returns severe-tagged features", async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    assert.match(String(url), /Severe%20Thunderstorm%20Warning/);
    return json({ features: [{ id: "a", geometry: square(-100), properties: { event: "Severe Thunderstorm Warning" } }] });
  };
  try {
    const response = await onRequestGet({ request: new Request("https://x/api/alerts?type=thunderstorm") });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.features[0].properties.ynkLayer, "severe");
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("null-geometry alerts get polygons from their affectedZones, cached", async () => {
  clearZoneCache();
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    if (url === ZONE_A) return json({ geometry: square(-105) });
    if (url === ZONE_B) return json({ geometry: { type: "MultiPolygon", coordinates: [square(-104).coordinates] } });
    return json({}, 404);
  };
  const features = [
    { id: "w", geometry: null, properties: { event: "Winter Storm Warning", ynkLayer: "winter", affectedZones: [ZONE_A, ZONE_B] } },
    { id: "f", geometry: null, properties: { event: "Dense Fog Advisory", ynkLayer: "fog", affectedZones: [ZONE_A] } },
    { id: "t", geometry: square(-99), properties: { event: "Tornado Warning", ynkLayer: "tornado", affectedZones: [ZONE_A] } },
  ];
  const out = await fillZoneGeometry(features, { fetchImpl });
  assert.equal(out[0].geometry.type, "MultiPolygon");
  assert.equal(out[0].geometry.coordinates.length, 2);
  assert.equal(out[0].properties.ynkGeometry, "zones");
  assert.equal(out[1].geometry.coordinates.length, 1);
  assert.equal(out[2], features[2], "features with geometry are untouched");
  assert.equal(calls.length, 2, "each zone fetched once");
  await fillZoneGeometry(features, { fetchImpl });
  assert.equal(calls.length, 2, "second pass served from cache");
});

test("zone fill caps concurrency and fails gracefully", async () => {
  clearZoneCache();
  let active = 0;
  let peak = 0;
  const zones = Array.from({ length: 12 }, (_, i) => `https://api.weather.gov/zones/forecast/KSZ${String(100 + i)}`);
  const fetchImpl = async (url) => {
    active += 1;
    peak = Math.max(peak, active);
    await new Promise((resolve) => setTimeout(resolve, 5));
    active -= 1;
    if (url.endsWith("100")) throw new Error("network");
    if (url.endsWith("101")) return json({}, 500);
    return json({ geometry: square(-98) });
  };
  const features = [
    { id: "x", geometry: null, properties: { ynkLayer: "wind", affectedZones: zones.slice(0, 2) } },
    { id: "y", geometry: null, properties: { ynkLayer: "wind", affectedZones: [...zones, "https://evil.example/zones/x"] } },
  ];
  const out = await fillZoneGeometry(features, { fetchImpl, concurrency: 3 });
  assert.ok(peak <= 3, `peak ${peak}`);
  assert.equal(out[0].geometry, null, "all zones failed -> stays null, no throw");
  assert.equal(out[1].geometry.coordinates.length, 10);
  const capped = await fillZoneGeometry([{ id: "z", geometry: null, properties: { affectedZones: zones } }], { fetchImpl: async () => { throw new Error("down"); }, maxZones: 2 });
  assert.equal(capped[0].geometry, null);
});

test("fetchEvents tags and fills in one pass", async () => {
  clearZoneCache();
  const fetchImpl = async (url) => {
    if (String(url).includes("/alerts/active")) {
      return json({ features: [{ id: "h", geometry: null, properties: { event: "High Wind Warning", affectedZones: [ZONE_A] } }] });
    }
    return json({ geometry: square(-105) });
  };
  const out = await fetchEvents(["High Wind Warning"], { fetchImpl });
  assert.equal(out.features[0].properties.ynkLayer, "wind");
  assert.equal(out.features[0].geometry.type, "MultiPolygon");
});

test("zone polygons are rounded and drop bad rings", () => {
  const polys = zonePolygons({ type: "Polygon", coordinates: [[[-105.12345, 40.00001], [-104.1, 40], [-104.1, 41], [-105.12345, 40.00001]], [[1, 1]]] });
  assert.deepEqual(polys[0][0][0], [-105.123, 40]);
  assert.equal(polys[0].length, 1);
  assert.deepEqual(zonePolygons(null), []);
});
