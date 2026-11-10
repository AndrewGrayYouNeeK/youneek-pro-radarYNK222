import assert from "node:assert/strict";
import test from "node:test";
import { nearestTransmitters, parseCclPayload, tuneInstruction } from "./stations.js";

const SAMPLE = `var cclData = [{"sitestate":"KY","lat":"37.591","freq":"162.475","sitename":"Jackson","lon":"-83.313","status":"NORMAL","callsign":"WXL58"},{"sitestate":"KY","lat":"38.253","freq":"162.475","sitename":"Louisville","lon":"-85.758","status":"NORMAL","callsign":"KIH43"}];`;

test("official NWR listing rows keep call sign, frequency, and location", () => {
  const stations = parseCclPayload(SAMPLE);
  assert.equal(stations.length, 2);
  assert.equal(stations[0].callsign, "WXL58");
  assert.equal(stations[0].frequencyMHz, "162.475");
  const nearest = nearestTransmitters(stations, 37.6, -83.3, 1);
  assert.equal(nearest[0].callsign, "WXL58");
  assert.match(tuneInstruction(nearest[0]), /Tune your weather radio to 162\.475 MHz \(WXL58\)/);
});

test("a broken listing does not invent a station", () => {
  assert.deepEqual(parseCclPayload("not json"), []);
  assert.equal(tuneInstruction(null).includes("MHz ("), false);
});
